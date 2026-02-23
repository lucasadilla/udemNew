"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useEditMode } from "@/contexts/edit-mode";

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  wrapperClassName?: string;
  onReplace?: (newUrl: string) => Promise<void>;
  /** "center" places the replace button in the middle of the image; default is bottom-right */
  replaceButtonPosition?: "bottom-right" | "center";
};

export function EditableImage({
  src,
  alt,
  width = 800,
  height = 400,
  className,
  fill,
  sizes,
  quality = 95,
  priority,
  wrapperClassName,
  onReplace,
  replaceButtonPosition = "bottom-right",
}: Props) {
  const { canEdit, isEditMode } = useEditMode();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showReplace =
    canEdit && isEditMode && typeof onReplace === "function";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !onReplace) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.url) await onReplace(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={`relative ${fill ? wrapperClassName ?? "" : "inline-block"}`}>
      {src ? (
        fill ? (
          <Image
            src={src}
            alt={alt}
            fill
            className={className}
            sizes={sizes ?? "100vw"}
            quality={quality}
            priority={priority}
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            quality={quality}
          />
        )
      ) : (
        <div
          className={`flex items-center justify-center bg-slate-100 text-slate-500 ${className}`}
          style={fill ? {} : { width, height }}
        >
          Aucune image
        </div>
      )}
      {showReplace && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={
              replaceButtonPosition === "center"
                ? "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-slate-800 px-3 py-1.5 text-sm text-white shadow hover:bg-slate-700 disabled:opacity-50"
                : "absolute bottom-2 right-2 rounded bg-slate-800 px-3 py-1.5 text-sm text-white shadow hover:bg-slate-700 disabled:opacity-50"
            }
          >
            {uploading ? "Envoi…" : (src ? "Remplacer" : "Choisir une image")}
          </button>
        </>
      )}
    </div>
  );
}
