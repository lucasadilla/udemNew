import { prisma } from "@/lib/prisma";
import { BlogClient } from "@/components/blog-client";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    include: { committeeMember: true },
  });

  const initialPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    coverImageUrl: p.coverImageUrl,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    committeeMember: p.committeeMember,
  }));

  return <BlogClient initialPosts={initialPosts} />;
}
