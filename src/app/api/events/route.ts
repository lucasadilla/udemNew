import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where: { startDate?: { gte?: Date; lte?: Date } } = {};
  if (from) where.startDate = { ...where.startDate, gte: new Date(from) };
  if (to) where.startDate = { ...where.startDate, lte: new Date(to) };
  const events = await prisma.event.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { startDate: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { title, description, startDate, endDate } = body as {
    title: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
  };
  if (!title?.trim() || !startDate) {
    return NextResponse.json(
      { error: "title et startDate requis" },
      { status: 400 }
    );
  }
  const created = await prisma.event.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { id, title, description, startDate, endDate } = body as {
    id: string;
    title?: string;
    description?: string | null;
    startDate?: string;
    endDate?: string | null;
  };
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const data: {
    title?: string;
    description?: string | null;
    startDate?: Date;
    endDate?: Date | null;
  } = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (startDate !== undefined) data.startDate = new Date(startDate);
  if (endDate !== undefined) {
    data.endDate = endDate ? new Date(endDate) : null;
  }
  const updated = await prisma.event.update({
    where: { id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
