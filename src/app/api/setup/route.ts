// src/app/api/setup/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    // 1. Verifica se o admin já existe para não criar duplicado
    const adminExists = await prisma.user.findUnique({ 
      where: { email: "admin@iot.com" } 
    });
    
    if (adminExists) {
      return NextResponse.json({ message: "Admin já existe! Pode fazer login." });
    }

    // 2. Criptografa a senha "admin123"
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 3. Salva no MongoDB
    const newAdmin = await prisma.user.create({
      data: {
        email: "admin@iot.com",
        password: hashedPassword,
        role: "ADMIN",
      }
    });

    return NextResponse.json({ 
      message: "Usuário Administrador criado com sucesso!", 
      email: newAdmin.email 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar admin." }, { status: 500 });
  }
}