// src/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Chama o NextAuth passando as credenciais
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Não deixa ele recarregar a tela sozinho
    });

    if (res?.error) {
      setError("Email ou senha incorretos.");
    } else {
      router.push("/dashboard"); // Se deu certo, vai para o painel
      router.refresh(); // Força a atualização da barra lateral
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="w-full max-w-md bg-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20">
        <div className="mb-6 text-center">
          <span className="text-5xl text-blue-400">⛅</span> 
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center">
          Acesso Restrito
        </h1>
        <p className="text-slate-300 mb-8 text-sm text-center">
          Insira suas credenciais para acessar a Estação.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu Email"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua Senha"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-600 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Voltar para o Início
          </Link>
        </div>
      </div>
    </main>
  );
}