// src/app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  // Se tentar acessar /dashboard sem logar, chuta de volta pra home
  if (!session) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* SIDEBAR LATERAL */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shadow-2xl z-10">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            <span>⛅</span> Estação IoT
          </h2>
          <p className="text-xs text-slate-400 mt-1">Logado como: <br/><span className="text-white font-mono">{session.user.email}</span></p>
          <span className="mt-2 inline-block px-2 py-1 bg-slate-800 text-xs rounded border border-slate-600 uppercase">
            Nível: {session.user.role}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            📱 Dispositivos
          </Link>
          
          {/* Rotas exclusivas para ADMIN (ou User, dependendo da sua regra fina) */}
          {isAdmin && (
            <>
              <Link href="/dashboard/users" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                👥 Gestão de Pessoas
              </Link>
              <Link href="/dashboard/logs" className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                📋 Painel de Auditoria
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          {/* NextAuth já lida com o logout de forma nativa chamando essa rota */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/api/auth/signout" className="block w-full text-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Sair do Sistema
            </a>
        </div>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (Onde o page.tsx vai ser injetado) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Menu Mobile Rápido (Simplificado para o MVP) */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
          <span className="font-bold">⛅ Estação IoT</span>
          <Link href="/api/auth/signout" className="text-sm bg-red-600 px-3 py-1 rounded">Sair</Link>
        </header>

        {/* O 'children' aqui é o seu page.tsx atual dos dispositivos */}
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}