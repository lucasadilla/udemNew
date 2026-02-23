import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u00C0-\u024F-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publishedOnly = searchParams.get("published") !== "false";
  if (!publishedOnly) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }
  const posts = await prisma.post.findMany({
    where: publishedOnly ? { publishedAt: { not: null } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { committeeMember: true },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const {
    title,
    slug,
    coverImageUrl,
    content,
    committeeMemberId,
    publishedAt,
  } = body as {
    title: string;
    slug?: string;
    coverImageUrl?: string | null;
    content?: string;
    committeeMemberId?: string | null;
    publishedAt?: string | null;
  };
  if (!title?.trim()) {
    return NextResponse.json(
      { error: "title requis" },
      { status: 400 }
    );
  }
  const finalSlug = slug?.trim() || slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
  let uniqueSlug = finalSlug;
  if (existing) {
    let n = 1;
    while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${finalSlug}-${n++}`;
    }
  }
  const created = await prisma.post.create({
    data: {
      title: title.trim(),
      slug: uniqueSlug,
      coverImageUrl: coverImageUrl ?? null,
      content: content ?? "",
      committeeMemberId: committeeMemberId || null,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
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
  const {
    id,
    title,
    slug,
    coverImageUrl,
    content,
    committeeMemberId,
    publishedAt,
  } = body as {
    id: string;
    title?: string;
    slug?: string;
    coverImageUrl?: string | null;
    content?: string;
    committeeMemberId?: string | null;
    publishedAt?: string | null;
  };
  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }
  const data: {
    title?: string;
    slug?: string;
    coverImageUrl?: string | null;
    content?: string;
    committeeMemberId?: string | null;
    publishedAt?: Date | null;
  } = {};
  if (title !== undefined) data.title = title;
  if (slug !== undefined) data.slug = slug;
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
  if (content !== undefined) data.content = content;
  if (committeeMemberId !== undefined) data.committeeMemberId = committeeMemberId;
  if (publishedAt !== undefined) {
    data.publishedAt = publishedAt ? new Date(publishedAt) : null;
  }
  const updated = await prisma.post.update({
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
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
