import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.committeeMember.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { imageUrl, name, title, order } = body as {
    imageUrl: string;
    name: string;
    title: string;
    order?: number;
  };
  if (!name?.trim() || !title?.trim()) {
    return NextResponse.json(
      { error: "Nom et titre sont requis." },
      { status: 400 }
    );
  }
  const max = await prisma.committeeMember.aggregate({ _max: { order: true } });
  const nextOrder = order ?? (max._max.order ?? -1) + 1;
  const created = await prisma.committeeMember.create({
    data: {
      imageUrl: imageUrl?.trim() || "",
      name: name.trim(),
      title: title.trim(),
      order: nextOrder,
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
  const { id, imageUrl, name, title, order } = body as {
    id: string;
    imageUrl?: string;
    name?: string;
    title?: string;
    order?: number;
  };
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const data: {
    imageUrl?: string;
    name?: string;
    title?: string;
    order?: number;
  } = {};
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (name !== undefined) data.name = name;
  if (title !== undefined) data.title = title;
  if (order !== undefined) data.order = order;
  const updated = await prisma.committeeMember.update({
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
  await prisma.committeeMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
