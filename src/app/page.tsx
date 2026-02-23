import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { committeeMember: true },
  });

  const recentPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    coverImageUrl: p.coverImageUrl,
    committeeMember: p.committeeMember,
  }));

  return <HomeClient recentPosts={recentPosts} />;
}
