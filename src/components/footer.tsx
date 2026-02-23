"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Footer() {
  const { data: session, status } = useSession();

  return (
    <footer className="w-full border-t border-slate-300/50 bg-[#f0efe9] px-4 py-6 text-center text-sm text-black sm:px-6 lg:px-8">
      <p className="text-center">
        ©{new Date().getFullYear()} Comité Femmes et Droit UdeM
      </p>
      <div className="mt-3">
        {status === "loading" ? (
          <span className="text-slate-500">...</span>
        ) : session ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-black hover:underline"
          >
            Déconnexion
          </button>
        ) : (
          <Link href="/admin/login" className="text-black hover:underline">
            Connexion
          </Link>
        )}
      </div>
    </footer>
  );
}
