import type { Metadata } from "next";
import { cookies } from "next/headers";
import localFont from "next/font/local";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

// Inter servida do próprio projeto (sem baixar do Google na hora de compilar)
const inter = localFont({ src: "./fonts/inter-latin.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Arena Fácil — Reserve quadras esportivas", template: "%s | Arena Fácil" },
  description: "Encontre quadras de society, futsal, vôlei, beach tennis e mais. Veja horários livres e reserve em poucos cliques.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Tema escolhido no botão do cabeçalho (cookie), para já desenhar a página certa
  const escuro = (await cookies()).get("tema")?.value === "escuro";

  return (
    <html lang="pt-BR" className={`${inter.variable}${escuro ? " dark" : ""}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-brand-950">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500">
            <span>© {new Date().getFullYear()} Arena Fácil</span>
            <nav className="flex gap-4">
              <Link href="/quadras" className="hover:text-slate-800">
                Quadras
              </Link>
              <Link href="/cadastro?tipo=dono" className="hover:text-slate-800">
                Anuncie sua quadra
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
