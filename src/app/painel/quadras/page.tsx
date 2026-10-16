import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { sportInfo } from "@/lib/constants";
import { formatHour, formatMoney } from "@/lib/format";
import { deleteCourt, toggleCourtActive } from "@/app/actions/courts";
import { CourtCover } from "@/components/CourtCard";
import { Flash } from "@/components/Flash";
import { SubmitButton } from "@/components/buttons";
import { EmptyState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Minhas quadras" };

export default async function PanelCourts({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const owner = await requireOwner();
  const sp = await searchParams;

  const courts = await db.court.findMany({
    where: { ownerId: owner.id },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <Flash ok={sp.ok} erro={sp.erro} />
      <PageHeader
        title="Minhas quadras"
        actions={
          <Link href="/painel/quadras/nova" className="btn btn-primary">
            + Nova quadra
          </Link>
        }
      />

      {courts.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {courts.map((c) => (
            <li key={c.id} className={`card flex overflow-hidden ${c.active ? "" : "opacity-70"}`}>
              <CourtCover court={c} className="w-28 shrink-0 sm:w-36" />
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-brand-700 uppercase">{sportInfo(c.sport).label}</p>
                    <h2 className="font-semibold">{c.name}</h2>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {c.active ? "No ar" : "Pausada"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatMoney(c.priceCents)}/h · {formatHour(c.openHour)}–{formatHour(c.closeHour)} · {c.city}
                </p>
                <p className="text-xs text-slate-500">{c._count.bookings} reservas no histórico</p>

                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <Link href={`/painel/quadras/${c.id}/editar`} className="btn btn-secondary btn-sm">
                    Editar
                  </Link>
                  <Link href={`/quadras/${c.id}`} className="btn btn-ghost btn-sm">
                    Ver página
                  </Link>
                  <form action={toggleCourtActive}>
                    <input type="hidden" name="id" value={c.id} />
                    <SubmitButton className="btn btn-ghost btn-sm" pendingText="…">
                      {c.active ? "Pausar" : "Ativar"}
                    </SubmitButton>
                  </form>
                  {c._count.bookings === 0 && (
                    <form action={deleteCourt}>
                      <input type="hidden" name="id" value={c.id} />
                      <SubmitButton className="btn btn-danger btn-sm" pendingText="…" confirm={`Excluir "${c.name}"? Não dá para desfazer.`}>
                        Excluir
                      </SubmitButton>
                    </form>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Nenhuma quadra cadastrada"
          action={
            <Link href="/painel/quadras/nova" className="btn btn-primary">
              Cadastrar quadra
            </Link>
          }
        />
      )}
    </>
  );
}
