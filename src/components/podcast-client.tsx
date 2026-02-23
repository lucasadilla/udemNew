"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useEditMode } from "@/contexts/edit-mode";

const PAGE_SIZE = 20;

type CommitteeMember = { id: string; name: string; title: string };
type Episode = {
  id: string;
  title: string;
  youtubeUrl: string;
  description: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  order: number;
  committeeMember: CommitteeMember | null;
};

function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
  const id = match ? match[1] : url;
  return `https://www.youtube.com/embed/${id}`;
}

type SortOrder = "newest" | "oldest";

export function PodcastClient() {
  const { canEdit, isEditMode } = useEditMode();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    youtubeUrl: "",
    description: "",
    coverImageUrl: "",
    publishedAt: "",
    committeeMemberId: "",
  });

  const sortedEpisodes = useMemo(() => {
    const copy = [...episodes];
    copy.sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (aDate !== bDate) return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
      return (a.order ?? 0) - (b.order ?? 0);
    });
    return copy;
  }, [episodes, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedEpisodes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedEpisodes = useMemo(
    () => sortedEpisodes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [sortedEpisodes, currentPage]
  );

  async function load() {
    try {
      const res = await fetch("/api/podcast");
      const text = await res.text();
      if (!text?.trim()) {
        setEpisodes([]);
        return;
      }
      const data = JSON.parse(text);
      setEpisodes(Array.isArray(data) ? data : []);
    } catch {
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    fetch("/api/committee")
      .then((r) => r.json())
      .then((list) => setMembers(Array.isArray(list) ? list : []))
      .catch(() => setMembers([]));
  }, []);

  async function submit() {
    if (editingId === "new") {
      await fetch("/api/podcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/podcast", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
    }
    setEditingId(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cet épisode ?")) return;
    await fetch(`/api/podcast?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setForm((f) => ({ ...f, coverImageUrl: data.url }));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <main className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Podcast
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Conversations et témoignages du Comité Femmes et Droit
        </p>
      </header>

      {episodes.length > 0 && (
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

      <div className="mx-auto mt-14 max-w-6xl">
      {episodes.length === 0 && !editingId && (
        <div className="min-h-[60vh] rounded-2xl border border-slate-200 bg-[#f0efe9] px-8 py-16 text-center sm:px-12 lg:px-20">
          <p className="text-xl font-medium text-slate-800 sm:text-2xl">
            Aucun épisode pour le moment
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-slate-600">
            Le podcast du Comité Femmes et Droit met en lumière des conversations et des témoignages
            autour des enjeux des femmes et du droit. De nouveaux épisodes seront bientôt disponibles ici.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-slate-600">
            Restez à l&apos;affût en nous suivant sur nos réseaux ou en consultant régulièrement cette page.
          </p>
          <div className="mt-16 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
            <div className="h-24 w-24 rounded-full bg-slate-200/60" aria-hidden />
            <div className="h-24 w-24 rounded-full bg-slate-200/60" aria-hidden />
            <div className="h-24 w-24 rounded-full bg-slate-200/60" aria-hidden />
          </div>
        </div>
      )}

      {editingId && (
        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-4 font-semibold">
            {editingId === "new" ? "Ajouter un épisode" : "Modifier"}
          </h2>
          <div className="flex flex-col gap-3">
            <input
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <input
              placeholder="URL YouTube"
              value={form.youtubeUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
              }
              className="rounded border border-slate-300 px-3 py-2"
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Image de couverture (optionnel)</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  placeholder="URL ou uploadez"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, coverImageUrl: e.target.value }))
                  }
                  className="flex-1 min-w-[200px] rounded border border-slate-300 px-3 py-2"
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploading ? "Envoi…" : "Choisir une image"}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date de l'épisode</label>
              <input
                type="date"
                value={form.publishedAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, publishedAt: e.target.value }))
                }
                className="rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Auteur / invité (membre du comité)</label>
              <select
                value={form.committeeMemberId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, committeeMemberId: e.target.value }))
                }
                className="w-full rounded border border-slate-300 px-3 py-2"
              >
                <option value="">— Choisir —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.title})
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Description courte"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={submit}
                className="rounded bg-slate-800 px-4 py-2 text-white"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded border border-slate-300 px-4 py-2"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {episodes.length > 0 && (
      <div className="space-y-10">
        {paginatedEpisodes.map((ep) => (
          <div
            key={ep.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
          >
            {ep.coverImageUrl && (
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={ep.coverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="mb-2 text-xl font-semibold text-slate-800">
                {ep.title}
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                {ep.publishedAt && (
                  <span>{new Date(ep.publishedAt).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}</span>
                )}
                {ep.publishedAt && ep.committeeMember && " · "}
                {ep.committeeMember && (
                  <span>{ep.committeeMember.name}</span>
                )}
              </p>
              {ep.description && (
                <p className="mb-4 text-slate-600">{ep.description}</p>
              )}
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={getYoutubeEmbedUrl(ep.youtubeUrl)}
                  title={ep.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              {canEdit && isEditMode && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(ep.id);
                      setForm({
                        title: ep.title,
                        youtubeUrl: ep.youtubeUrl,
                        description: ep.description,
                        coverImageUrl: ep.coverImageUrl ?? "",
                        publishedAt: ep.publishedAt ? ep.publishedAt.slice(0, 10) : "",
                        committeeMemberId: ep.committeeMember?.id ?? "",
                      });
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(ep.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {canEdit && isEditMode && !editingId && (
        <button
          type="button"
          onClick={() => {
            setEditingId("new");
            setForm({
              title: "",
              youtubeUrl: "",
              description: "",
              coverImageUrl: "",
              publishedAt: "",
              committeeMemberId: "",
            });
          }}
          className="mt-8 rounded-lg border-2 border-dashed border-slate-300 px-6 py-3 text-slate-600"
        >
          + Ajouter un épisode
        </button>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
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
      </div>
    </main>
  );
}
