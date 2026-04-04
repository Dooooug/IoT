// src/app/api/users/verify/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 👇 O nosso espião no terminal 👇
    console.log(`[VERIFICAÇÃO] Chegou do formulário: '${code}' | Tem no Banco: '${user?.verificationCode}'`);

    if (!user || user.verificationCode !== code) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    // Código correto: Atualiza o status e apaga o código
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isEmailVerified: true,
        verificationCode: null 
      }
    });

    return NextResponse.json({ message: "Conta ativada!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Falha na verificação." }, { status: 500 });
  }
}