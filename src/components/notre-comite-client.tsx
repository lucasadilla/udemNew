"use client";

import { useEffect, useState, useRef } from "react";
import { EditableImage } from "./editable-image";
import { useEditMode } from "@/contexts/edit-mode";

type Member = {
  id: string;
  imageUrl: string;
  name: string;
  title: string;
  order: number;
};

export function NotreComiteClient() {
  const { canEdit, isEditMode } = useEditMode();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", title: "", imageUrl: "" });
  const [uploading, setUploading] = useState(false);
  const addPhotoInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/committee");
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveMemberImage(id: string, url: string) {
    await fetch("/api/committee", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, imageUrl: url }),
    });
    await load();
  }

  function startEdit(m: Member) {
    setEditingId(m.id);
    setForm({ name: m.name, title: m.title, imageUrl: m.imageUrl });
  }

  async function submitMember() {
    const isAdd = !editingId || editingId === "new";
    if (isAdd) {
      if (!form.name.trim() || !form.title.trim()) {
        alert("Nom et titre sont requis.");
        return;
      }
      const res = await fetch("/api/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          title: form.title.trim(),
          imageUrl: form.imageUrl.trim() || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Impossible d'ajouter le membre.");
        return;
      }
      setForm({ name: "", title: "", imageUrl: "" });
      setEditingId(null);
    } else {
      const res = await fetch("/api/committee", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.error || "Impossible de modifier le membre.");
        return;
      }
      setEditingId(null);
      setForm({ name: "", title: "", imageUrl: "" });
    }
    await load();
  }

  async function handleAddPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.url) setForm((f) => ({ ...f, imageUrl: data.url }));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function deleteMember(id: string) {
    if (!confirm("Supprimer ce membre ?")) return;
    await fetch(`/api/committee?id=${id}`, { method: "DELETE" });
    await load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#e6dede] px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
          NOTRE COMITÉ
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Les personnes qui font vivre le Comité Femmes et Droit
        </p>
      </header>

      {/* Add/edit form: always visible in edit mode so you can add directly from the page */}
      {(canEdit && isEditMode) || editingId ? (
        <div className="mb-8 rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-4 font-semibold text-slate-800">
            {editingId && editingId !== "new" ? "Modifier le membre" : "Ajouter un membre"}
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Remplissez les champs ci-dessous pour ajouter un membre directement sur cette page.
          </p>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-slate-700">Nom</label>
            <input
              placeholder="Nom du membre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <label className="text-sm font-medium text-slate-700">Titre</label>
            <input
              placeholder="Titre ou rôle"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2"
            />
            <label className="text-sm font-medium text-slate-700">Photo (optionnel)</label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                placeholder="URL de l'image ou uploadez ci-dessous"
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                className="flex-1 min-w-[200px] rounded border border-slate-300 px-3 py-2"
              />
              <input
                ref={addPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAddPhotoUpload}
              />
              <button
                type="button"
                onClick={() => addPhotoInputRef.current?.click()}
                disabled={uploading}
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {uploading ? "Envoi…" : "Choisir une photo"}
              </button>
            </div>
            {form.imageUrl && (
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200">
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={submitMember}
                className="rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
              >
                {editingId && editingId !== "new" ? "Enregistrer" : "Ajouter le membre"}
              </button>
              {(editingId && editingId !== "new") && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setForm({ name: "", title: "", imageUrl: "" }); }}
                  className="rounded border border-slate-300 px-4 py-2"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-14 flex w-full max-w-6xl flex-wrap justify-center gap-12 sm:gap-16">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex w-full shrink-0 flex-col items-center text-center sm:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2.67rem)]"
          >
            <div className="relative mb-4 h-96 w-96 flex-shrink-0 overflow-visible">
              {/* Member photo: circular, inset so the ring frames it */}
              <div className="absolute inset-[7%] overflow-hidden rounded-full bg-slate-200">
                <EditableImage
                  src={m.imageUrl}
                  alt={m.name}
                  fill
                  sizes="(min-width: 400px) 372px, 90vw"
                  wrapperClassName="h-full w-full"
                  className="object-cover object-[center_50%]"
                  onReplace={(url) => saveMemberImage(m.id, url)}
                  replaceButtonPosition="center"
                />
              </div>
              {/* Decorative ring frame on top – scaled up so the ring is bigger */}
              <img
                src="/images/ring.png"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-contain scale-112 -translate-x-1"
                aria-hidden
              />
            </div>
            <h3 className="text-lg font-bold text-black">{m.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{m.title}</p>
            {canEdit && isEditMode && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(m)}
                  className="rounded border border-slate-400 bg-white px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => deleteMember(m.id)}
                  className="rounded border border-red-500 bg-white px-4 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </main>
  );
}
