"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-text-style";
import { FontSize } from "@tiptap/extension-text-style";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// ----- Toolbar: heading dropdown -----
function HeadingSelect({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const level = editor.isActive("heading", { level: 1 })
    ? 1
    : editor.isActive("heading", { level: 2 })
      ? 2
      : editor.isActive("heading", { level: 3 })
        ? 3
        : 0;
  const value = level ? `h${level}` : "p";

  return (
    <select
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "p") editor.chain().focus().setParagraph().run();
        else editor.chain().focus().toggleHeading({ level: parseInt(v[1], 10) as 1 | 2 | 3 }).run();
      }}
      className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
      title="Style du paragraphe"
    >
      <option value="p">Paragraphe</option>
      <option value="h1">Titre 1</option>
      <option value="h2">Titre 2</option>
      <option value="h3">Titre 3</option>
    </select>
  );
}

// ----- Toolbar: font size -----
const FONT_SIZES = [
  { label: "Par défaut", value: "" },
  { label: "Petit", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Moyen", value: "16px" },
  { label: "Grand", value: "18px" },
  { label: "Très grand", value: "24px" },
];

function FontSizeSelect({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const current = editor.getAttributes("textStyle").fontSize || "";

  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        if (v) editor.chain().focus().setFontSize(v).run();
        else editor.chain().focus().unsetFontSize().run();
      }}
      className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
      title="Taille du texte"
    >
      {FONT_SIZES.map(({ label, value }) => (
        <option key={value || "default"} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

// ----- Toolbar: color -----
const TEXT_COLORS: { name: string; value: string }[] = [
  { name: "Par défaut", value: "" },
  { name: "Noir", value: "#1e293b" },
  { name: "Gris", value: "#64748b" },
  { name: "Rouge", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Vert", value: "#16a34a" },
  { name: "Bleu", value: "#2563eb" },
  { name: "Violet", value: "#7c3aed" },
];

function ColorSelect({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const current = editor.getAttributes("textStyle").color || "";

  return (
    <div className="flex items-center gap-1">
      <select
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          if (v) editor.chain().focus().setColor(v).run();
          else editor.chain().focus().unsetColor().run();
        }}
        className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
        title="Couleur du texte"
      >
        {TEXT_COLORS.map((c) => (
          <option key={c.value || "default"} value={c.value}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="color"
        className="h-8 w-8 cursor-pointer rounded border border-slate-300 p-0.5"
        value={current || "#1e293b"}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        title="Choisir une couleur"
      />
    </div>
  );
}

// ----- Toolbar: format buttons -----
function FormatButtons({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("bold") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Gras (Ctrl+B)"
      >
        <span className="font-bold text-slate-700">B</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("italic") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Italique (Ctrl+I)"
      >
        <span className="italic text-slate-700">I</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("underline") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Souligné"
      >
        <span className="underline text-slate-700">U</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("strike") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Barré"
      >
        <span className="text-slate-700 line-through">S</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`flex h-8 w-8 items-center justify-center rounded font-mono text-xs ${
          editor.isActive("code") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Code inline"
      >
        &lt;/&gt;
      </button>
    </div>
  );
}

// ----- Toolbar: alignment -----
function AlignButtons({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[
        { align: "left" as const, title: "Aligner à gauche" },
        { align: "center" as const, title: "Centrer" },
        { align: "right" as const, title: "Aligner à droite" },
        { align: "justify" as const, title: "Justifier" },
      ].map(({ align, title }) => (
        <button
          key={align}
          type="button"
          onClick={() => editor.chain().focus().setTextAlign(align).run()}
          className={`flex h-8 w-8 items-center justify-center rounded ${
            editor.isActive({ textAlign: align }) ? "bg-slate-200" : "hover:bg-slate-100"
          }`}
          title={title}
        >
          <span
            className="text-slate-600"
            style={{
              textAlign: align === "justify" ? "justify" : align,
              width: "1rem",
              display: "block",
              fontSize: "0.7rem",
            }}
          >
            {align === "left" && "≡"}
            {align === "center" && "≡"}
            {align === "right" && "≡"}
            {align === "justify" && "≡"}
          </span>
        </button>
      ))}
    </div>
  );
}

// ----- Toolbar: lists & blocks -----
function ListBlockButtons({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("bulletList") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Liste à puces"
      >
        <span className="text-slate-600">•</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("orderedList") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Liste numérotée"
      >
        <span className="text-slate-600 text-sm">1.</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`flex h-8 w-8 items-center justify-center rounded ${
          editor.isActive("blockquote") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Citation"
      >
        <span className="text-slate-600">"</span>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`flex h-8 w-8 items-center justify-center rounded font-mono text-xs ${
          editor.isActive("codeBlock") ? "bg-slate-200" : "hover:bg-slate-100"
        }`}
        title="Bloc de code"
      >
        {"{}"}
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
        title="Ligne horizontale"
      >
        <span className="text-slate-500">—</span>
      </button>
    </div>
  );
}

// ----- Modals for Link and Image -----
function LinkModal({
  onClose,
  onInsert,
  initialUrl = "",
}: {
  onClose: () => void;
  onInsert: (url: string) => void;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 font-semibold text-slate-800">Insérer un lien</h3>
        <input
          ref={inputRef}
          type="url"
          value={url ?? ""}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mb-4 w-full rounded border border-slate-300 px-3 py-2 text-slate-800"
          onKeyDown={(e) => e.key === "Enter" && onInsert(url)}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-slate-700"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => url.trim() && onInsert(url.trim())}
            className="rounded bg-slate-800 px-4 py-2 text-white"
          >
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageModal({
  onClose,
  onInsertUrl,
  onUpload,
}: {
  onClose: () => void;
  onInsertUrl: (url: string, options?: { width?: number; height?: number }) => void;
  onUpload: (file: File) => void;
}) {
  const [tab, setTab] = useState<"url" | "file">("url");
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    if (!url.trim()) return;
    const w = width.trim() ? parseInt(width, 10) : undefined;
    const h = height.trim() ? parseInt(height, 10) : undefined;
    onInsertUrl(url.trim(), { width: w && w > 0 ? w : undefined, height: h && h > 0 ? h : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 font-semibold text-slate-800">Insérer une image</h3>
        <div className="mb-3 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`border-b-2 px-3 py-1.5 text-sm ${
              tab === "url"
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-500"
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`border-b-2 px-3 py-1.5 text-sm ${
              tab === "file"
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-500"
            }`}
          >
            Fichier
          </button>
        </div>
        {tab === "url" ? (
          <>
            <input
              type="url"
              value={url ?? ""}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mb-3 w-full rounded border border-slate-300 px-3 py-2 text-slate-800"
            />
            <div className="mb-4 flex gap-3 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-slate-600">Largeur (px):</span>
                <input
                  type="number"
                  min={50}
                  max={1200}
                  value={width ?? ""}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="auto"
                  className="w-20 rounded border border-slate-300 px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-slate-600">Hauteur (px):</span>
                <input
                  type="number"
                  min={50}
                  max={800}
                  value={height ?? ""}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="auto"
                  className="w-20 rounded border border-slate-300 px-2 py-1"
                />
              </label>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              Dans l&apos;article, vous pourrez aussi redimensionner l&apos;image en la sélectionnant et en tirant les poignées.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2">
                Annuler
              </button>
              <button
                type="button"
                onClick={handleInsert}
                className="rounded bg-slate-800 px-4 py-2 text-white"
              >
                Insérer
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
                e.target.value = "";
                onClose();
              }}
            />
            <p className="mb-4 text-sm text-slate-600">
              Choisissez une image sur votre ordinateur. Elle sera envoyée sur le serveur (Cloudinary si configuré).
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded bg-slate-800 px-4 py-2 text-white"
              >
                Choisir un fichier
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ----- Main toolbar -----
function Toolbar({
  editor,
  onOpenLink,
  onOpenImage,
  onImageUpload,
}: {
  editor: Editor | null;
  onOpenLink: () => void;
  onOpenImage: () => void;
  onImageUpload: (file: File) => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center gap-2">
        <HeadingSelect editor={editor} />
      </div>
      <span className="h-6 w-px bg-slate-300" />
      <div className="flex items-center gap-2">
        <FontSizeSelect editor={editor} />
        <ColorSelect editor={editor} />
      </div>
      <span className="h-6 w-px bg-slate-300" />
      <FormatButtons editor={editor} />
      <span className="h-6 w-px bg-slate-300" />
      <AlignButtons editor={editor} />
      <span className="h-6 w-px bg-slate-300" />
      <ListBlockButtons editor={editor} />
      <span className="h-6 w-px bg-slate-300" />
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 disabled:opacity-40"
          title="Annuler"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100 disabled:opacity-40"
          title="Rétablir"
        >
          ↷
        </button>
        <button
          type="button"
          onClick={() => {
          editor.chain().focus().unsetColor().unsetFontSize().clearNodes().unsetAllMarks().run();
        }}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
          title="Effacer le formatage"
        >
          ✕
        </button>
      </div>
      <span className="h-6 w-px bg-slate-300" />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenLink}
          className={`flex h-8 items-center gap-1.5 rounded px-2 ${
            editor.isActive("link") ? "bg-slate-200" : "hover:bg-slate-100"
          }`}
          title="Insérer ou modifier un lien"
        >
          <span className="text-slate-600">🔗</span>
          <span className="text-sm">Lien</span>
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="flex h-8 items-center gap-1.5 rounded px-2 hover:bg-slate-100 text-sm text-slate-600"
            title="Supprimer le lien"
          >
            Retirer le lien
          </button>
        )}
        <button
          type="button"
          onClick={onOpenImage}
          className="flex h-8 items-center gap-1.5 rounded px-2 hover:bg-slate-100"
          title="Insérer une image"
        >
          <span className="text-slate-600">🖼</span>
          <span className="text-sm">Image</span>
        </button>
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImageUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ----- Editor content area styles -----
const editorContentStyles = `
  .rich-editor {
    min-height: 280px;
    padding: 1rem 1.25rem;
    outline: none;
  }
  .rich-editor p { margin-bottom: 0.75em; }
  .rich-editor p:last-child { margin-bottom: 0; }
  .rich-editor h1 { font-size: 1.75rem; font-weight: 700; margin: 1em 0 0.5em; }
  .rich-editor h2 { font-size: 1.35rem; font-weight: 600; margin: 0.9em 0 0.4em; }
  .rich-editor h3 { font-size: 1.15rem; font-weight: 600; margin: 0.8em 0 0.35em; }
  .rich-editor ul,
  .rich-editor .prose ul {
    list-style-type: disc !important;
    list-style-position: outside;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }
  .rich-editor ol,
  .rich-editor .prose ol {
    list-style-type: decimal !important;
    list-style-position: outside;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }
  .rich-editor li,
  .rich-editor .prose li {
    display: list-item !important;
    margin: 0.25em 0;
  }
  .rich-editor li::marker,
  .rich-editor .prose li::marker {
    color: #64748b;
  }
  .rich-editor blockquote {
    border-left: 4px solid #cbd5e1;
    padding-left: 1em;
    margin: 0.75em 0;
    color: #64748b;
  }
  .rich-editor pre {
    background: #f1f5f9;
    border-radius: 6px;
    padding: 1em;
    overflow-x: auto;
    margin: 0.75em 0;
    font-size: 0.9em;
  }
  .rich-editor code { font-family: ui-monospace, monospace; font-size: 0.9em; }
  .rich-editor p code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; }
  .rich-editor img { max-width: 100%; height: auto; border-radius: 6px; }
  /* Resizable image wrapper and handles (TipTap) */
  .rich-editor [data-resizable-wrapper] {
    position: relative;
    display: inline-block;
    max-width: 100%;
  }
  .rich-editor [data-resize-handle] {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #2563eb;
    border: 2px solid white;
    border-radius: 2px;
    cursor: nwse-resize;
    z-index: 10;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  .rich-editor [data-resize-handle="bottom-right"] { bottom: -6px; right: -6px; cursor: nwse-resize; }
  .rich-editor [data-resize-handle="bottom-left"] { bottom: -6px; left: -6px; cursor: nesw-resize; }
  .rich-editor [data-resize-handle="top-right"] { top: -6px; right: -6px; cursor: nesw-resize; }
  .rich-editor [data-resize-handle="top-left"] { top: -6px; left: -6px; cursor: nwse-resize; }
  .rich-editor hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.25em 0; }
  .rich-editor a { color: #2563eb; text-decoration: underline; }
  .rich-editor .is-empty.first::before,
  .rich-editor [data-placeholder]::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    float: left;
    height: 0;
    pointer-events: none;
  }
  .rich-editor .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: #94a3b8;
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

function RichTextEditorInner({
  content,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [linkModal, setLinkModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({
        allowBase64: false,
        resize: {
          enabled: true,
          minWidth: 80,
          minHeight: 80,
          alwaysPreserveAspectRatio: false,
        },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: "_blank", rel: "noopener" } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "rich-editor prose prose-slate max-w-none text-slate-800",
      },
      handleDOMEvents: {
        blur: () => {
          onChange(editor?.getHTML() ?? "");
        },
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  const handleLinkInsert = useCallback(
    (url: string) => {
      if (!editor) return;
      editor.chain().focus().setLink({ href: url }).run();
      setLinkModal(false);
      setLinkUrl("");
    },
    [editor]
  );

  const handleImageUrlInsert = useCallback(
    (url: string, options?: { width?: number; height?: number }) => {
      if (!editor) return;
      editor.chain().focus().setImage({
        src: url,
        width: options?.width,
        height: options?.height,
      }).run();
      setImageModal(false);
    },
    [editor]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;
      setImageUploading(true);
      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data?.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
          setImageModal(false);
        } else {
          alert(data?.error || "Upload impossible. Vérifiez la configuration Cloudinary.");
        }
      } catch {
        alert("Erreur lors de l'upload.");
      } finally {
        setImageUploading(false);
      }
    },
    [editor]
  );

  return (
    <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-white">
      <style dangerouslySetInnerHTML={{ __html: editorContentStyles }} />
      <Toolbar
        editor={editor}
        onOpenLink={() => setLinkModal(true)}
        onOpenImage={() => setImageModal(true)}
        onImageUpload={handleImageUpload}
      />
      <EditorContent editor={editor} />
      {linkModal && (
        <LinkModal
          onClose={() => setLinkModal(false)}
          onInsert={handleLinkInsert}
          initialUrl={editor?.getAttributes("link").href || linkUrl}
        />
      )}
      {imageModal && (
        <ImageModal
          onClose={() => setImageModal(false)}
          onInsertUrl={handleImageUrlInsert}
          onUpload={handleImageUpload}
        />
      )}
      {imageUploading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/90 text-slate-600">
          Envoi de l&apos;image…
        </div>
      )}
    </div>
  );
}

export function RichTextEditor(props: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <div className="min-h-[280px] flex items-center justify-center text-slate-500 text-sm">
          Chargement de l&apos;éditeur…
        </div>
      </div>
    );
  }
  return <RichTextEditorInner {...props} />;
}
