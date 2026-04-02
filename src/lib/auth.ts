// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // 1. Verifica se o usuário preencheu os campos de email e senha
        if (!credentials?.email || !credentials?.password) return null;
        
        // 2. Busca o usuário no banco de dados MongoDB via Prisma
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        });
        
        // 3. Se não achar o usuário cadastrado, bloqueia o login
        if (!user) return null;
        
        // 4. Compara a senha digitada no form com a senha criptografada do banco
        const isValidPassword = bcrypt.compareSync(credentials.password, user.password);
        if (!isValidPassword) return null;

        // 5. Retorna os dados que queremos guardar na sessão (incluindo o ID e o nível de acesso 'role')
        return { id: user.id, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    // O JWT pega os dados do 'authorize' acima e coloca no token seguro do cookie
    async jwt({ token, user }) {
      if (user) { 
        token.role = user.role; 
        token.id = user.id; 
      }
      return token;
    },
    // A Session pega os dados do token e deixa disponível para o front-end e back-end usarem
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  // 👇 ESTA É A LINHA QUE RESOLVE O ERRO DE DESCRIPTOGRAFIA (JWT_SESSION_ERROR) 👇
  // Ela força o NextAuth a usar a sua variável de ambiente para abrir/fechar o cadeado do token.
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};