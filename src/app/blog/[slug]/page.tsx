import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { committeeMember: true },
  });
  if (!post || !post.publishedAt) notFound();

  return (
    <main className="w-full bg-[#e6dede] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-4 inline-block text-sm text-slate-600 hover:underline"
        >
          ← Retour au blog
        </Link>

        <article className="overflow-hidden rounded-lg bg-white shadow-md">
          {post.coverImageUrl && (
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <Image
                src={post.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          )}

          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <header className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                {post.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-6">
                {post.committeeMember?.imageUrl ? (
                  <img
                    src={post.committeeMember.imageUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
                )}
                <span className="text-sm font-medium text-slate-600">
                  {post.committeeMember?.name ?? "—"}
                </span>
                <span className="text-slate-400" aria-hidden>
                  ·
                </span>
                <time
                  dateTime={post.publishedAt}
                  className="text-sm text-slate-500"
                >
                  {new Date(post.publishedAt).toLocaleDateString("fr-CA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            </header>

            <div
              className="blog-post-prose"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}
