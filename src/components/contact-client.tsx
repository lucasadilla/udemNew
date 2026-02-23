"use client";

import { useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/femmesetdroit/";
const CONTACT_EMAIL = "femmesetdroit.udem@gmail.com";

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

type ContactClientProps = { embedded?: boolean };

export function ContactClient({ embedded }: ContactClientProps) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Échec de l'envoi. Réessayez plus tard.");
        return;
      }
      setSent(true);
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch {
      setError("Une erreur est survenue. Réessayez plus tard.");
    } finally {
      setSending(false);
    }
  }

  const Wrapper = embedded ? "section" : "main";
  return (
    <Wrapper
      className={`w-full bg-[#e6dede] px-4 sm:px-6 lg:px-8 ${embedded ? "py-12" : "py-16"}`}
      id={embedded ? "contact" : undefined}
    >
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column: heading, intro, email, Instagram */}
        <div className="flex flex-col">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-800 md:text-5xl">
            Restons en contact
          </h1>
          <p className="mt-3 text-xl italic text-slate-700">
            N&apos;hésitez pas à nous écrire !
          </p>
          <p className="mt-6 text-base text-slate-600">
            Pour toute question ou pour nous saluer, utilisez le formulaire
            ci-contre.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <EnvelopeIcon className="h-6 w-6 shrink-0 text-slate-700" />
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-black underline hover:no-underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="mt-8">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
              aria-label="Instagram"
            >
              <img
                src="/images/insta.png"
                alt=""
                className="h-6 w-6 object-contain hover:opacity-80"
              />
            </a>
          </div>
        </div>

        {/* Right column: contact form */}
        <div className="rounded-xl border border-slate-200 bg-[#f0efe9] p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Prénom
                </span>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="rounded border border-slate-300 bg-white px-3 py-2.5 text-black focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">Nom</span>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="rounded border border-slate-300 bg-white px-3 py-2.5 text-black focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                Courriel <span className="text-slate-500">*</span>
              </span>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                className="rounded border border-slate-300 bg-white px-3 py-2.5 text-black focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Message</span>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, message: e.target.value }))
                }
                rows={5}
                className="resize-y rounded border border-slate-300 bg-white px-3 py-2.5 text-black focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>
{error && (
              <p className="rounded bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                {error}
              </p>
            )}
            {sent ? (
              <p className="text-sm font-medium text-green-800">
                Message envoyé. Nous vous répondrons dès que possible.
              </p>
            ) : (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded bg-[#e8b4b8] px-6 py-2.5 text-base font-medium text-slate-800 hover:bg-[#dd9ea3] disabled:opacity-60"
                >
                  {sending ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Wrapper>
  );
}
