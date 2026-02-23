import type { Metadata } from "next";
import { Geist, Geist_Mono, Felipa } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { EditModeProvider } from "@/contexts/edit-mode";
import { Header } from "@/components/header";
import { FooterWrapper } from "@/components/footer-wrapper";
import { PartnersStripWrapper } from "@/components/partners-strip-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const felipa = Felipa({
  weight: "400",
  variable: "--font-felipa",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Femmes et Droit UdeM",
  description: "Comité Femmes et Droit UdeM",
  icons: {
    icon: [
      { url: "/flavi.PNG", sizes: "64x64", type: "image/png" },
      { url: "/flavi.PNG", sizes: "32x32", type: "image/png" },
      { url: "/flavi.PNG", sizes: "96x96", type: "image/png" },
      { url: "/flavi.PNG", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/flavi.PNG", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} ${felipa.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <EditModeProvider>
            <Header />
            <div className="flex min-h-0 flex-1 flex-col">
              {children}
              <PartnersStripWrapper />
            </div>
            <FooterWrapper />
          </EditModeProvider>
        </Providers>
      </body>
    </html>
  );
}
