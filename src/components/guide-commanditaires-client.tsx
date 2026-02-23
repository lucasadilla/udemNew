"use client";

import { useEffect, useState, useRef } from "react";
import { useEditMode } from "@/contexts/edit-mode";

type Sponsor = { id: string; imageUrl: string; order: number };

export function GuideCommanditairesClient() {
  const { canEdit, isEditMode } = useEditMode();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const addImageInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/sponsors");
    const data = await res.json();
    setSponsors(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submitImage(url: string) {
    if (!url.trim()) return;
    const res = await fetch("/api/sponsors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: url.trim() }),
    });
    if (res.ok) {
      await load();
      setShowAddForm(false);
      setAddUrl("");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Impossible d'ajouter l'image.");
    }
  }

  async function handleAddImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        await submitImage(data.url);
      } else {
        alert(data?.error || "Échec de l'upload.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette image ?")) return;
    await fetch(`/api/sponsors?id=${id}`, { method: "DELETE" });
    await load();
  }

  async function reorder(fromIndex: number, toIndex: number) {
    const reordered = [...sponsors];
    const [item] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, item!);
    const body = reordered.map((s, i) => ({ id: s.id, order: i }));
    await fetch("/api/sponsors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSponsors(reordered);
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, toIndex: number) {
    e.preventDefault();
    if (draggedId === null) return;
    const fromIndex = sponsors.findIndex((s) => s.id === draggedId);
    if (fromIndex === -1 || fromIndex === toIndex) {
      setDraggedId(null);
      return;
    }
    reorder(fromIndex, toIndex);
    setDraggedId(null);
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function lightboxPrev() {
    if (sponsors.length === 0) return;
    setLightboxIndex((i) =>
      i === null ? 0 : (i - 1 + sponsors.length) % sponsors.length
    );
  }

  function lightboxNext() {
    if (sponsors.length === 0) return;
    setLightboxIndex((i) =>
      i === null ? 0 : (i + 1) % sponsors.length
    );
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

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
          Guide des commanditaires
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Découvrez ceux qui soutiennent le Comité Femmes et Droit
        </p>
      </header>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((s, index) => (
          <div
            key={s.id}
            className="flex min-w-0 justify-center"
          >
            <div
              draggable={canEdit && isEditMode}
              onDragStart={(e) => handleDragStart(e, s.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => setDraggedId(null)}
              className={`relative inline-flex max-w-full border-2 border-black p-2 ${
                canEdit && isEditMode ? "cursor-move" : ""
              } ${draggedId === s.id ? "opacity-50" : ""}`}
            >
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="relative block max-w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <img
                  src={s.imageUrl}
                  alt=""
                  className="block h-auto max-h-[32rem] w-full max-w-full object-contain"
                />
              </button>
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(s.id); }}
                  className="absolute -right-1 -top-1 z-10 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && sponsors[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label="Vue agrandie"
        >
          {/* Clickable backdrop — clicking outside the image closes */}
          <div
            className="absolute inset-0"
            onClick={closeLightbox}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Fermer"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Image précédente"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            aria-label="Image suivante"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div
            className="relative z-10 flex max-h-[92vh] max-w-[95vw] items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Use img so the clickable area is only the image, not the full viewport */}
            <img
              src={sponsors[lightboxIndex].imageUrl}
              alt=""
              className="max-h-[92vh] w-auto max-w-[95vw] object-contain"
            />
          </div>
          <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-sm text-white/80">
            {lightboxIndex + 1} / {sponsors.length}
          </p>
        </div>
      )}

      {canEdit && isEditMode && (
        <div className="mt-8">
          {showAddForm ? (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
              <h3 className="mb-4 font-semibold text-slate-800">Ajouter une image</h3>
              <input
                type="url"
                placeholder="URL de l'image"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                className="mb-4 w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={addImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddImageUpload}
                />
                <button
                  type="button"
                  onClick={() => addImageInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploading ? "Envoi…" : "Choisir une photo"}
                </button>
                <button
                  type="button"
                  onClick={() => submitImage(addUrl)}
                  disabled={!addUrl.trim()}
                  className="rounded bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddUrl(""); }}
                  className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="rounded-lg border-2 border-dashed border-slate-300 px-6 py-3 text-slate-600 hover:border-slate-500"
            >
              + Ajouter une image
            </button>
          )}
          <p className="mt-2 text-sm text-slate-500">
            Glissez-déposez les images pour changer l'ordre.
          </p>
        </div>
      )}
    </main>
  );
}
