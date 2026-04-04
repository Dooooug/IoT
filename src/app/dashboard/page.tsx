// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import DeviceCard from "./DeviceCard";
import { Device, Protocol, Prisma } from "@prisma/client";
import AddDeviceButton from "./AddDeviceButton"; // <-- Importamos o nosso novo botão!

// O Next.js passa automaticamente os parâmetros da URL para a página
export default async function Dashboard({
  searchParams,
}: {
  searchParams: { q?: string; protocol?: Protocol };
}) {
  const session = await getServerSession(authOptions); 
  if (!session) return <p>Faça login.</p>;

  // 1. Prepara a base da busca combinando o texto e o filtro de protocolo
  const searchQuery = searchParams.q || "";
  const protocolFilter = searchParams.protocol;

  const whereClause: Prisma.DeviceWhereInput = {
    name: { contains: searchQuery, mode: "insensitive" },
  };

  if (protocolFilter) {
    whereClause.protocol = protocolFilter;
  }

  let devices: Device[] = [];

  // 2. Aplica as regras de visualização (RBAC) em cima da busca
  if (session.user.role === "ADMIN") {
    // Admin vê tudo que bater com o filtro
    devices = await prisma.device.findMany({ where: whereClause });
  } 
  else if (session.user.role === "USER") {
    // Usuário vê os dele e dos visitantes, aplicando o filtro
    devices = await prisma.device.findMany({
      where: {
        ...whereClause,
        OR: [
          { ownerId: session.user.id },
          { owner: { parentId: session.user.id } }
        ]
      }
    });
  } 
  else {
    // Visitante vê os do seu "Pai"
    const visitor = await prisma.user.findUnique({ 
      where: { id: session.user.id } 
    });
    
    if (visitor?.parentId) {
      devices = await prisma.device.findMany({ 
        where: { 
          ...whereClause, 
          ownerId: visitor.parentId 
        } 
      });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Meus Dispositivos IoT</h1>
        
        {/* Acoplamos o form de filtro e o botão Novo Hardware juntos aqui */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <form className="flex gap-2">
            <input 
              type="text" 
              name="q" 
              defaultValue={searchQuery}
              placeholder="Buscar dispositivo..." 
              className="px-3 py-2 border rounded-md text-sm text-black"
            />
            <select 
              name="protocol" 
              defaultValue={protocolFilter || ""}
              className="px-3 py-2 border rounded-md text-sm text-black"
            >
              <option value="">Todos</option>
              <option value="WIFI">Wi-Fi</option>
              <option value="ZIGBEE">Zigbee</option>
              <option value="BLUETOOTH">Bluetooth</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold">
              Filtrar
            </button>
          </form>

          {/* O nosso Botão que chama o Modal (Só aparece para ADMIN ou USER) */}
          {session.user.role !== "VISITOR" && (
            <AddDeviceButton />
          )}
        </div>
      </div>
      
      {devices.length === 0 ? (
        <p className="text-gray-500">Nenhum dispositivo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}