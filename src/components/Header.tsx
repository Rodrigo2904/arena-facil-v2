import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight whitespace-nowrap text-brand-700">
          <span aria-hidden>⚽</span> Arena Fácil
        </Link>

        <nav className="flex items-center gap-1 text-sm whitespace-nowrap">
          <Link href="/quadras" className="btn btn-ghost hidden sm:inline-flex">
            Quadras
          </Link>
          {user ? (
            <>
              <Link href="/minhas-reservas" className={`btn btn-ghost px-2.5 sm:px-4 ${user.role === "OWNER" ? "hidden sm:inline-flex" : ""}`}>
                Minhas reservas
              </Link>
              {user.role === "OWNER" && (
                <Link href="/painel" className="btn btn-ghost px-2.5 sm:px-4">
                  Painel
                </Link>
              )}
              <form action={logout} className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
                <span className="hidden text-slate-500 md:inline">Olá, {user.name.split(" ")[0]}</span>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className="btn btn-ghost px-2.5 sm:px-4">
                Entrar
              </Link>
              <Link href="/cadastro" className="btn btn-primary px-3 sm:px-4">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
