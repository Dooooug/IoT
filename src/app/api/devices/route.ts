// src/app/api/devices/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();
  
  // Regra de segurança: Bloqueia quem não está logado ou é apenas VISITANTE
  if (!session || session.user.role === "VISITOR") {
    return NextResponse.json({ error: "Acesso negado. Visitantes não podem cadastrar dispositivos." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, protocol } = body;

    // Reconhecimento e validação rígida do protocolo
    const validProtocols = ["WIFI", "ZIGBEE", "BLUETOOTH"];
    if (!validProtocols.includes(protocol)) {
      return NextResponse.json({ error: "Protocolo inválido ou não suportado." }, { status: 400 });
    }

    // Cria o dispositivo e vincula ao ID do usuário que fez a requisição
    const newDevice = await prisma.device.create({
      data: {
        name,
        protocol,
        ownerId: session.user.id,
      }
    });

    // Registra a ação no histórico de Logs para auditoria do Admin
    await prisma.log.create({
      data: {
        action: `Cadastrou novo dispositivo via ${protocol}`,
        deviceId: newDevice.id,
        userId: session.user.id
      }
    });

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error) {
    console.error("Erro no cadastro:", error); // <-- Adicionamos o uso da variável aqui
    return NextResponse.json({ error: "Erro interno ao cadastrar dispositivo." }, { status: 500 });
  }
}