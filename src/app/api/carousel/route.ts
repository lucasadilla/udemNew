import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.carouselImage.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { imageUrl, order } = body as { imageUrl: string; order?: number };
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl requis" }, { status: 400 });
  }
  const max = await prisma.carouselImage.aggregate({ _max: { order: true } });
  const nextOrder = order ?? (max._max.order ?? -1) + 1;
  const created = await prisma.carouselImage.create({
    data: { imageUrl, order: nextOrder },
  });
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { id, imageUrl, order } = body as {
    id: string;
    imageUrl?: string;
    order?: number;
  };
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const data: { imageUrl?: string; order?: number } = {};
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (order !== undefined) data.order = order;
  const updated = await prisma.carouselImage.update({
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
  await prisma.carouselImage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
