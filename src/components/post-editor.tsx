"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "./rich-text-editor";

type CommitteeMember = { id: string; name: string; title: string };

type Props = {
  postId?: string;
  initial?: {
    title: string;
    slug: string;
    coverImageUrl: string;
    content: string;
    committeeMemberId?: string;
    publishedAt: string;
  };
};

export function PostEditor({ postId, initial }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl ?? ""
  );
  const [content, setContent] = useState(initial?.content ?? "");
  const [committeeMemberId, setCommitteeMemberId] = useState(initial?.committeeMemberId ?? "");
  const [publishedAt, setPublishedAt] = useState(initial?.publishedAt ?? "");
  const [draft, setDraft] = useState(!initial?.publishedAt);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/committee")
      .then((r) => r.json())
      .then((list) => {
        setMembers(Array.isArray(list) ? list : []);
        if (!committeeMemberId && list?.[0]) setCommitteeMemberId(list[0].id);
        setMembersLoaded(true);
      })
      .catch(() => setMembersLoaded(true));
  }, []);

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) setCoverImageUrl(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function save(publish: boolean) {
    if (!title.trim()) {
      alert("Titre requis.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        coverImageUrl: coverImageUrl || null,
        content,
        committeeMemberId: committeeMemberId || null,
        publishedAt: publish
          ? new Date(publishedAt || Date.now()).toISOString()
          : null,
      };
      const res = postId
        ? await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: postId, ...body }),
          })
        : await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Erreur lors de l'enregistrement.");
        return;
      }
      router.push("/blog");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!postId || !confirm("Supprimer cet article ?")) return;
    await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
    router.push("/blog");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Titre</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="Titre de l'article"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Slug (URL)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
          placeholder="laisser vide pour générer automatiquement"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Image de couverture</label>
        <div className="flex items-center gap-4">
          {coverImageUrl && (
            <img
              src={coverImageUrl}
              alt=""
              className="h-24 w-40 rounded object-cover"
            />
          )}
          <div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="cover-upload"
              onChange={handleCoverFile}
            />
            <label
              htmlFor="cover-upload"
              className="inline-block cursor-pointer rounded bg-slate-200 px-4 py-2 text-sm hover:bg-slate-300"
            >
              {uploading ? "Upload…" : "Choisir une image"}
            </label>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Auteur (membre du comité)</label>
        {membersLoaded && members.length === 0 ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Aucun membre au comité.{" "}
            <Link href="/notre-comite" className="font-medium underline">
              Ajoutez d&apos;abord au moins un membre sur la page Notre Comité
            </Link>{" "}
            (en mode édition) pour pouvoir les choisir comme auteur.
          </div>
        ) : (
          <select
            value={committeeMemberId}
            onChange={(e) => setCommitteeMemberId(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">— Choisir un auteur —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.title})
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Date de publication</label>
        <input
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2"
        />
        <label className="ml-3">
          <input
            type="checkbox"
            checked={draft}
            onChange={(e) => setDraft(e.target.checked)}
          />
          <span className="ml-1 text-sm">Brouillon</span>
        </label>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Contenu</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Contenu de l'article…"
        />
      </div>
      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Enregistrer en brouillon
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving}
          className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
        >
          Publier
        </button>
        {postId && (
          <button
            type="button"
            onClick={deletePost}
            className="rounded border border-red-300 bg-white px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
        )}
        <Link
          href="/blog"
          className="rounded border border-slate-300 px-4 py-2"
        >
          Annuler
        </Link>
      </div>
    </div>
  );
}
