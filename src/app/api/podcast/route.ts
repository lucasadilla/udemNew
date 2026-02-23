import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const episodes = await prisma.podcastEpisode.findMany({
      orderBy: { order: "asc" },
      include: { committeeMember: true },
    });
    return NextResponse.json(episodes);
  } catch (err) {
    console.error("GET /api/podcast:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { title, youtubeUrl, description, coverImageUrl, publishedAt, committeeMemberId, order } = body as {
    title: string;
    youtubeUrl: string;
    description?: string;
    coverImageUrl?: string | null;
    publishedAt?: string | null;
    committeeMemberId?: string | null;
    order?: number;
  };
  if (!title?.trim() || !youtubeUrl?.trim()) {
    return NextResponse.json(
      { error: "title et youtubeUrl requis" },
      { status: 400 }
    );
  }
  const max = await prisma.podcastEpisode.aggregate({ _max: { order: true } });
  const nextOrder = order ?? (max._max.order ?? -1) + 1;
  const created = await prisma.podcastEpisode.create({
    data: {
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      description: description?.trim() ?? "",
      coverImageUrl: coverImageUrl?.trim() || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      committeeMemberId: committeeMemberId || null,
      order: nextOrder,
    },
    include: { committeeMember: true },
  });
  return NextResponse.json(created);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const { id, title, youtubeUrl, description, coverImageUrl, publishedAt, committeeMemberId, order } = body as {
    id: string;
    title?: string;
    youtubeUrl?: string;
    description?: string;
    coverImageUrl?: string | null;
    publishedAt?: string | null;
    committeeMemberId?: string | null;
    order?: number;
  };
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const data: {
    title?: string;
    youtubeUrl?: string;
    description?: string;
    coverImageUrl?: string | null;
    publishedAt?: Date | null;
    committeeMemberId?: string | null;
    order?: number;
  } = {};
  if (title !== undefined) data.title = title;
  if (youtubeUrl !== undefined) data.youtubeUrl = youtubeUrl;
  if (description !== undefined) data.description = description;
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
  if (publishedAt !== undefined) data.publishedAt = publishedAt ? new Date(publishedAt) : null;
  if (committeeMemberId !== undefined) data.committeeMemberId = committeeMemberId;
  if (order !== undefined) data.order = order;
  const updated = await prisma.podcastEpisode.update({
    where: { id },
    data,
    include: { committeeMember: true },
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
  await prisma.podcastEpisode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
