// src/types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  // Estende o tipo Session para incluir id e role
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // Estende o tipo User retornado pelo authorize
  interface User {
    id: string;
    role: string;
  }
}