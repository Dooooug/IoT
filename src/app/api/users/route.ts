import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Regra de Negócio: Apenas ADMIN cria USER/ADMIN. USER cria VISITANTE.
  if (!session || session.user.role === "VISITOR") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { email, password, role } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const userExists = await prisma.user.findUnique({ where: { email } });
    let userId = "";

    // LÓGICA DE UPSERT: Sobrescreve se for um cadastro "preso", ou cria do zero.
    if (userExists) {
      if (userExists.isEmailVerified) {
        return NextResponse.json({ error: "Este e-mail já está ativado no sistema." }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role,
          verificationCode: otpCode,
          parentId: session.user.id,
        }
      });
      userId = updatedUser.id;
      
    } else {
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          parentId: session.user.id,
          verificationCode: otpCode,
          isEmailVerified: false,
        }
      });
      userId = newUser.id;
    }

    // --- CONFIGURAÇÃO DO CARTEIRO ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Ignora bloqueios de certificado local (útil para testes no Windows)
      tls: {
        rejectUnauthorized: false
      }
    });

    // --- ENVIO DO E-MAIL ---
    await transporter.sendMail({
      from: `"Estação Meteorológica" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Seu Código de Acesso ⛅",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #2563eb;">Bem-vindo à Estação!</h2>
          <p>Você foi convidado para gerenciar dispositivos IoT. Use o código abaixo para ativar sua conta:</p>
          <div style="background: #f8fafc; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; border: 2px dashed #cbd5e1; letter-spacing: 8px;">
            ${otpCode}
          </div>
          <p style="font-size: 13px; color: #64748b; margin-top: 25px;">
            Este código expira em breve. Se você não solicitou este acesso, ignore este e-mail.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ userId }, { status: 201 });
  } catch (error) {
    console.error("Erro detalhado (Prisma/Nodemailer):", error);
    return NextResponse.json({ error: "Erro ao processar cadastro." }, { status: 500 });
  }
}