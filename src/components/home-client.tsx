"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { EditableImage } from "./editable-image";
import { ContactClient } from "./contact-client";

const BANNER_KEY = "bannerImageUrl";

type CommitteeMember = { id: string; name: string; title: string; imageUrl: string };
type RecentPost = {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  committeeMember: CommitteeMember | null;
};

type Props = {
  recentPosts: RecentPost[];
};

export function HomeClient({ recentPosts = [] }: Props) {
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bannerAspect, setBannerAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!bannerUrl) {
      setBannerAspect(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setBannerAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = bannerUrl;
  }, [bannerUrl]);

  async function load() {
    try {
      const settingsRes = await fetch("/api/settings");
      let settings: Record<string, string> = {};
      const settingsText = await settingsRes.text();
      if (settingsText && settingsRes.ok) {
        try {
          settings = JSON.parse(settingsText);
        } catch {
          // ignore invalid JSON
        }
      }
      setBannerUrl(settings[BANNER_KEY] ?? "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveBanner(url: string) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: BANNER_KEY, value: url }),
    });
    setBannerUrl(url);
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-0">
      {/* Banner: viewport-relative height so it scales consistently in all browsers */}
      <section
        className="relative w-full bg-slate-200"
        style={{
          height: bannerAspect
            ? `min(calc(100vw / ${bannerAspect}), 90vh)`
            : "clamp(420px, 70vh, 900px)",
        }}
      >
        <div className="absolute inset-0">
          <EditableImage
            src={bannerUrl}
            alt="Bannière"
            fill
            sizes="100vw"
            quality={95}
            priority
            wrapperClassName="h-full w-full"
            className="object-contain object-center"
            onReplace={saveBanner}
            replaceButtonPosition="center"
          />
        </div>
        {/* Dark overlay with text — same see-through black on all viewports */}
        <div
          className="banner-overlay absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-center bg-black/45 px-3 py-5 text-center md:px-4 md:py-10"
          style={{ minHeight: "28%" }}
        >
          <h1 className="font-felipa text-2xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            FEMMES & DROIT
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs font-normal leading-snug text-white md:mt-2 md:text-base">
            Promotion du féminisme intersectionnel auprès de la communauté étudiante de l&apos;Université de Montréal
          </p>
        </div>
      </section>

      {recentPosts.length > 0 && (
        <section className="w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Articles Récents</h2>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
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
                    <h3 className="line-clamp-2 text-xl font-bold leading-snug text-slate-800 transition-colors group-hover:text-slate-900 sm:text-[1.25rem]">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <ContactClient embedded />
    </main>
  );
}
