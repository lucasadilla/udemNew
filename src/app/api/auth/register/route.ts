import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// One-time admin registration. In production, protect this or remove and use seed.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un admin avec cet email existe déjà." },
        { status: 400 }
      );
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: { email, passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Email et mot de passe (8 caractères min) requis." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
