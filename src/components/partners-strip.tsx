"use client";

import { useEffect, useState, useRef } from "react";
import { useEditMode } from "@/contexts/edit-mode";

type CarouselItem = { id: string; imageUrl: string; order: number };

export function PartnersStrip() {
  const { canEdit, isEditMode } = useEditMode();
  const [carousel, setCarousel] = useState<CarouselItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const addImageInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/carousel");
      const text = await res.text();
      if (text && res.ok) {
        try {
          const data = JSON.parse(text);
          setCarousel(Array.isArray(data) ? data : []);
        } catch {
          setCarousel([]);
        }
      } else {
        setCarousel([]);
      }
    } catch {
      setCarousel([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitCarouselImage(url: string) {
    if (!url.trim()) return;
    const res = await fetch("/api/carousel", {
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
        await submitCarouselImage(data.url);
      } else {
        alert(data?.error || "Échec de l'upload.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeCarouselImage(id: string) {
    if (!confirm("Supprimer cette image du carrousel ?")) return;
    await fetch(`/api/carousel?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section className="border-b border-slate-300/50 bg-[#e6dede] pt-8 pb-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {canEdit && isEditMode && (
          showAddForm ? (
            <div className="mb-6 flex flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 shadow-sm">
              <input
                type="url"
                placeholder="URL de l'image"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
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
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploading ? "Envoi…" : "Choisir une photo"}
                </button>
                <button
                  type="button"
                  onClick={() => submitCarouselImage(addUrl)}
                  disabled={!addUrl.trim()}
                  className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddUrl(""); }}
                  className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="rounded border-2 border-dashed border-slate-300 bg-white px-4 py-2 text-sm text-slate-500 hover:border-slate-500"
              >
                + Ajouter un partenaire
              </button>
            </div>
          )
        )}
        {carousel.length > 0 ? (
          <div className="flex w-full overflow-hidden">
            <ul
              className="flex shrink-0 items-center gap-16 py-6"
              style={{
                width: "max-content",
                animation: "infinite-scroll-continuous 30s linear infinite",
              }}
            >
              {[...carousel, ...carousel, ...carousel, ...carousel].map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="relative shrink-0 list-none"
                >
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-28 w-auto max-h-32 object-contain opacity-90 hover:opacity-100 md:h-36 md:max-h-40"
                  />
                  {canEdit && isEditMode && (
                    <button
                      type="button"
                      onClick={() => removeCarouselImage(item.id)}
                      className="absolute -top-1 -right-1 z-10 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white shadow hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
