import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = s.value;
    return NextResponse.json(map);
  } catch (e) {
    console.error("GET /api/settings:", e);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { key, value } = body as { key: string; value: string };
  if (!key) {
    return NextResponse.json({ error: "key requis" }, { status: 400 });
  }
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value ?? "" },
    update: { value: value ?? "" },
  });
  return NextResponse.json({ ok: true });
}
