"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useEditMode } from "@/contexts/edit-mode";

const PAGE_SIZE = 20;

type CommitteeMember = { id: string; name: string; title: string; imageUrl: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  committeeMember: CommitteeMember | null;
};

type Props = {
  initialPosts: Post[];
};

type SortOrder = "newest" | "oldest";

export function BlogClient({ initialPosts }: Props) {
  const { canEdit, isEditMode } = useEditMode();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  const sortedPosts = useMemo(() => {
    const copy = [...posts];
    copy.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
    });
    return copy;
  }, [posts, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = useMemo(
    () => sortedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedPosts, currentPage]
  );

  useEffect(() => {
    if (canEdit && isEditMode) {
      setLoading(true);
      fetch("/api/posts?published=false")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setPosts(Array.isArray(data) ? data : []))
        .catch(() => setPosts(initialPosts))
        .finally(() => setLoading(false));
    } else {
      setPosts(initialPosts);
    }
  }, [canEdit, isEditMode, initialPosts]);

  if (canEdit && isEditMode) {
    return (
      <main className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Blog</h1>
            <Link
              href="/admin/blog/new"
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
            >
              Nouvel article
            </Link>
          </div>
          {loading ? (
            <p className="text-slate-500">Chargement…</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {posts.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-[#f0efe9] px-8 py-12 text-center">
                  <p className="text-slate-600">Aucun article. Cliquez sur « Nouvel article » pour commencer.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <article>
                      <Link href={post.publishedAt ? `/blog/${post.slug}` : "#"} className="block">
                        {post.coverImageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                            <Image
                              src={post.coverImageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 50vw"
                              quality={95}
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="mb-3 flex items-center gap-3">
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
                            {!post.publishedAt && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                Brouillon
                              </span>
                            )}
                          </div>
                          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-800">
                            {post.title}
                          </h2>
                        </div>
                      </Link>
                      <div className="border-t border-slate-100 px-5 py-3">
                        <Link
                          href={`/admin/blog/${post.id}`}
                          className="text-sm font-medium text-purple-600 hover:underline"
                        >
                          Modifier
                        </Link>
                      </div>
                    </article>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-4 py-14 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Blog
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Actualités et réflexions du Comité Femmes et Droit
        </p>
      </header>

      {sortedPosts.length > 0 && (
        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            Trier par
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as SortOrder);
                setPage(1);
              }}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            >
              <option value="newest">Plus récents</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </label>
        </div>
      )}

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-[#f0efe9] px-8 py-16 text-center">
            <p className="text-slate-600">Aucun article pour le moment.</p>
          </div>
        ) : (
          paginatedPosts.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {post.coverImageUrl && (
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={post.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={95}
                    />
                  </div>
                )}
                <div className="flex flex-col p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-3">
                    {post.committeeMember?.imageUrl ? (
                      <img
                        src={post.committeeMember.imageUrl}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow"
                      />
                    ) : (
                      <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200" />
                    )}
                    <span className="text-sm font-medium text-slate-600">
                      {post.committeeMember?.name ?? "—"}
                    </span>
                  </div>
                  <h2 className="line-clamp-2 text-xl font-bold leading-snug text-slate-800 transition-colors group-hover:text-slate-900 sm:text-[1.25rem]">
                    {post.title}
                  </h2>
                </div>
              </Link>
            </article>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white"
          >
            Précédent
          </button>
          <span className="flex items-center gap-1 px-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`min-w-[2.25rem] rounded px-2 py-2 text-sm font-medium ${
                  p === currentPage
                    ? "bg-slate-800 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 disabled:hover:bg-white"
          >
            Suivant
          </button>
        </nav>
      )}
    </main>
  );
}
