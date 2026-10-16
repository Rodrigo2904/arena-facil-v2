import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { SPORTS } from "@/lib/constants";
import { parseMoneyToCents } from "@/lib/format";
import { CourtCard } from "@/components/CourtCard";
import { Flash } from "@/components/Flash";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Quadras" };
export const dynamic = "force-dynamic";

type Search = { cidade?: string; esporte?: string; busca?: string; preco?: string; erro?: string };

export default async function CourtsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const busca = sp.busca?.trim() ?? "";
  const maxCents = sp.preco ? parseMoneyToCents(sp.preco) : null;

  const where: Prisma.CourtWhereInput = { active: true };
  if (sp.cidade) where.city = sp.cidade;
  if (sp.esporte && sp.esporte in SPORTS) where.sport = sp.esporte;
  if (maxCents) where.priceCents = { lte: maxCents };
  if (busca) where.OR = [{ name: { contains: busca } }, { neighborhood: { contains: busca } }];

  const [courts, cities] = await Promise.all([
    db.court.findMany({ where, orderBy: [{ priceCents: "asc" }, { name: "asc" }] }),
    db.court.findMany({ where: { active: true }, select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
  ]);
  const hasFilters = Boolean(sp.cidade || sp.esporte || busca || maxCents);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Flash erro={sp.erro} />
      <PageHeader
        title="Quadras disponíveis"
        subtitle={`${courts.length} ${courts.length === 1 ? "quadra encontrada" : "quadras encontradas"}`}
      />

      <form className="card mb-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <input name="busca" defaultValue={busca} placeholder="Nome da quadra ou bairro" className="input" aria-label="Buscar" />
        <select name="cidade" defaultValue={sp.cidade ?? ""} className="input" aria-label="Cidade">
          <option value="">Todas as cidades</option>
          {cities.map((c) => (
            <option key={c.city}>{c.city}</option>
          ))}
        </select>
        <select name="esporte" defaultValue={sp.esporte ?? ""} className="input" aria-label="Modalidade">
          <option value="">Todas as modalidades</option>
          {Object.entries(SPORTS).map(([key, s]) => (
            <option key={key} value={key}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          name="preco"
          defaultValue={sp.preco ?? ""}
          inputMode="decimal"
          placeholder="Até R$/hora"
          className="input"
          aria-label="Preço máximo por hora"
        />
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1">Filtrar</button>
          {hasFilters && (
            <Link href="/quadras" className="btn btn-ghost">
              Limpar
            </Link>
          )}
        </div>
      </form>

      {courts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((c) => (
            <CourtCard key={c.id} court={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma quadra encontrada"
          text="Tente mudar os filtros ou buscar em outra cidade."
          action={
            <Link href="/quadras" className="btn btn-secondary">
              Ver todas as quadras
            </Link>
          }
        />
      )}
    </div>
  );
}
