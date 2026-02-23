import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/post-editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { committeeMember: true },
  });
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        Modifier l'article
      </h1>
      <PostEditor
        postId={post.id}
        initial={{
          title: post.title,
          slug: post.slug,
          coverImageUrl: post.coverImageUrl ?? "",
          content: post.content,
          committeeMemberId: post.committeeMemberId ?? "",
          publishedAt: post.publishedAt?.toISOString().slice(0, 10) ?? "",
        }}
      />
    </main>
  );
}
