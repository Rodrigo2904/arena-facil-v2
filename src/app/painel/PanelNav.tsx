"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/painel", label: "Pedidos", exact: true },
  { href: "/painel/mensalistas", label: "Mensalistas" },
  { href: "/painel/reservas", label: "Reservas" },
  { href: "/painel/quadras", label: "Quadras" },
];

export function PanelNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  return (
    <nav className="-mb-px flex gap-6 overflow-x-auto text-sm font-medium" aria-label="Painel">
      {TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 border-b-2 py-3 whitespace-nowrap ${
              active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.label}
            {t.href === "/painel" && pending > 0 && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">{pending}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
