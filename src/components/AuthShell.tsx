import type { ReactNode } from "react";

// Moldura das telas de entrar/cadastro: painel verde da marca à esquerda
// (no celular vira uma faixa no topo) e o formulário à direita.
export function AuthShell({
  headline,
  text,
  bullets,
  title,
  subtitle,
  children,
  footer,
}: {
  headline: string;
  text: string;
  bullets?: string[];
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 lg:flex lg:min-h-[calc(100dvh-9.5rem)] lg:items-center">
      <div className="card grid w-full overflow-hidden lg:grid-cols-2">
        <aside className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 p-6 text-white sm:p-10">
          <CourtLines />
          <div className="relative flex h-full flex-col">
            <p className="text-sm font-semibold tracking-wide text-brand-100 uppercase">⚽ Arena Fácil</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{headline}</h2>
            <p className="mt-2 text-brand-100">{text}</p>
            {bullets && (
              <ul className="mt-8 hidden space-y-4 sm:block">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold" aria-hidden>
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="flex flex-col justify-center p-6 sm:p-10">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-slate-600">{subtitle}</p>
          {children}
          {footer && <div className="mt-6 space-y-2 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/** Desenho de um campo (linhas da quadra) bem suave ao fundo. */
function CourtLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-white/10"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden
    >
      <rect x="30" y="30" width="340" height="540" rx="6" />
      <line x1="30" y1="300" x2="370" y2="300" />
      <circle cx="200" cy="300" r="60" />
      <circle cx="200" cy="300" r="4" fill="currentColor" />
      <rect x="110" y="30" width="180" height="90" />
      <rect x="110" y="480" width="180" height="90" />
      <path d="M160 120 a40 40 0 0 0 80 0" />
      <path d="M160 480 a40 40 0 0 1 80 0" />
    </svg>
  );
}
