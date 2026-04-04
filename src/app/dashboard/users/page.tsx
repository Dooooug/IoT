"use client";
import { useState } from "react";

export default function UsersPage() {
  const [step, setStep] = useState(1); // 1: Cadastro, 2: Verificação
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Captura os dados do formulário de forma segura com FormData
    const formData = new FormData(e.currentTarget);
    const emailValue = formData.get("email") as string;

    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: emailValue,
        password: formData.get("password"),
        role: formData.get("role")
      })
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      setUserId(data.userId);
      setEmail(emailValue);
      setStep(2);
    } else {
      alert("Erro: " + data.error);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Captura o código e remove qualquer espaço em branco invisível
    const rawCode = formData.get("code") as string;
    const cleanCode = rawCode.replace(/\s/g, "");

    const res = await fetch("/api/users/verify", {
      method: "POST",
      body: JSON.stringify({ 
        userId, 
        code: cleanCode 
      })
    });
    
    setLoading(false);
    
    if (res.ok) {
      alert("Usuário ativado com sucesso!");
      setStep(1); // Volta para a tela inicial de cadastro
    } else {
      alert("Código inválido ou expirado!");
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Gestão de Acessos</h1>
      
      {step === 1 ? (
        <form onSubmit={handleRegister} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border">
          <input name="email" type="email" placeholder="E-mail" required className="w-full p-3 border rounded-lg" />
          <input name="password" type="password" placeholder="Senha Inicial" required className="w-full p-3 border rounded-lg" />
          <select name="role" className="w-full p-3 border rounded-lg">
            <option value="USER">Usuário</option>
            <option value="VISITOR">Visitante</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            {loading ? "Processando..." : "Cadastrar e Enviar E-mail"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border text-center">
          <p className="text-sm text-slate-600">Insira o código enviado para <br/><strong>{email}</strong></p>
          <input name="code" type="text" maxLength={6} placeholder="000000" required className="w-full p-4 text-center text-3xl font-mono tracking-widest border-2 border-blue-200 rounded-xl outline-none focus:border-blue-500" />
          <button disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">
            {loading ? "Verificando..." : "Ativar Conta"}
          </button>
        </form>
      )}
    </div>
  );
}