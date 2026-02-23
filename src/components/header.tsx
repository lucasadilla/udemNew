"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEditMode } from "@/contexts/edit-mode";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/blog", label: "Blog" },
  { href: "/podcast", label: "Podcasts" },
  { href: "/contact", label: "Contact" },
  { href: "/evenements", label: "Événements" },
  { href: "/notre-comite", label: "Notre Comité" },
  { href: "/guide-commanditaires", label: "Guide des commanditaires" },
];

const INSTAGRAM_URL = "https://www.instagram.com/femmesetdroit/";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function HamburgerToXIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <span className={`relative block h-6 w-6 ${className ?? ""}`} aria-hidden>
      <span
        className={`absolute left-0 right-0 top-1 h-0.5 origin-center bg-current transition-all duration-200 ease-out ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-current transition-all duration-200 ease-out ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute bottom-1 left-0 right-0 h-0.5 origin-center bg-current transition-all duration-200 ease-out ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { canEdit, isEditMode, setEditMode } = useEditMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/50 bg-[#f0efe9]">
      {/* Desktop: logo + nav left, admin + Instagram right */}
      <div className="hidden h-20 w-full items-center justify-between gap-6 px-4 sm:px-6 md:flex lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <Link href="/" className="relative flex shrink-0 items-center">
            <img
              src="/images/logo femme et droit-Photoroom.png"
              alt="Comité Femmes et Droit UdeM"
              className="h-11 w-auto object-contain object-left"
            />
          </Link>
          <nav className="flex items-center gap-9">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-underline text-base text-black ${active ? "font-bold" : "font-medium"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {canEdit && (
            <button
              type="button"
              onClick={() => setEditMode(!isEditMode)}
              className={`rounded px-2 py-1.5 text-sm font-medium text-black ${
                isEditMode ? "bg-slate-300" : "bg-slate-200"
              }`}
            >
              {isEditMode ? "Édition" : "Éditer"}
            </button>
          )}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
            aria-label="Instagram"
          >
            <img src="/images/insta.png" alt="" className="h-7 w-7 object-contain" />
          </a>
        </div>
      </div>

      {/* Mobile: logo left, Instagram center, hamburger right */}
      <div className="grid h-20 w-full grid-cols-3 items-center px-4 md:hidden">
        <div className="flex justify-start">
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/images/logo femme et droit-Photoroom.png"
              alt="Comité Femmes et Droit UdeM"
              className="h-11 w-auto object-contain object-left"
            />
          </Link>
        </div>
        <div className="flex justify-center">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:opacity-80"
            aria-label="Instagram"
          >
            <img src="/images/insta.png" alt="" className="h-7 w-7 object-contain" />
          </a>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded text-black hover:opacity-80"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <HamburgerToXIcon open={mobileMenuOpen} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown: nav links + admin */}
      {mobileMenuOpen && (
        <nav className="flex flex-col border-t border-slate-300/50 bg-[#f0efe9] px-4 py-4 md:hidden">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`border-b border-slate-200/50 py-3 text-base text-black last:border-0 ${active ? "font-bold" : "font-medium"}`}
              >
                {link.label}
              </Link>
            );
          })}
          {canEdit && (
            <div className="mt-2 border-t border-slate-200/50 pt-3">
              <button
                type="button"
                onClick={() => {
                  setEditMode(!isEditMode);
                  setMobileMenuOpen(false);
                }}
                className={`w-full rounded px-2 py-2 text-left text-sm font-medium text-black ${
                  isEditMode ? "bg-slate-300" : "bg-slate-200"
                }`}
              >
                {isEditMode ? "Édition" : "Éditer"}
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
