// src/app/api/devices/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Verifica se a sessão existe e tem um email válido
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
  }

  try {
    const { name, protocol } = await req.json();

    // 1. Busca o usuário verdadeiro no banco usando o e-mail da sessão
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // 2. Agora sim, cria o dispositivo garantindo que o ownerId é uma String válida
    const newDevice = await prisma.device.create({
      data: {
        name,
        protocol,
        status: false,
        ownerId: dbUser.id, 
      }
    });

    return NextResponse.json({ message: "Dispositivo registrado!", device: newDevice }, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar dispositivo:", error);
    return NextResponse.json({ error: "Erro interno ao cadastrar." }, { status: 500 });
  }
}