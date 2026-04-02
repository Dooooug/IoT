// src/app/page.tsx
import Link from "next/link"; // <-- 1. Importação obrigatória do componente Link do Next.js

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 text-center">
      <div className="max-w-2xl bg-white/10 p-8 md:p-12 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20">
        <div className="mb-8">
          {/* Ícone da nossa Estação Meteorológica */}
          <span className="text-6xl text-blue-400">⛅</span> 
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Seja bem-vindo à <br/>
          <span className="text-blue-400">Estação Meteorológica</span>
        </h1>
        
        <p className="text-lg text-slate-300 mb-8 max-w-lg mx-auto">
          Monitore sensores, controle dispositivos e gerencie acessos em tempo real com nossa plataforma IoT inteligente.
        </p>

        {/* 2. A grande mudança! 
          Removemos o comentário do eslint e a tag <a> padrão.
          Usamos o <Link> do Next.js apontando diretamente para a nossa nova rota "/login".
          Como o "/login" é uma página visual React e não uma API interna, a navegação agora é SPA (Single Page Application).
        */}
        <Link 
          href="/login" 
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
        >
          Entrar no Sistema
        </Link>
      </div>
    </main>
  );
}