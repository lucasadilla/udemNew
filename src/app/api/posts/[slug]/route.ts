import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { committeeMember: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }
  return NextResponse.json(post);
}
