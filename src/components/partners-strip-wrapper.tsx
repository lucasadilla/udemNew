"use client";

import { usePathname } from "next/navigation";
import { PartnersStrip } from "./partners-strip";

export function PartnersStripWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <PartnersStrip />;
}
