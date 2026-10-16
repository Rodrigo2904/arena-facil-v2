import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";
import { formatDateShort, formatMoney, formatSlot, formatWeekday } from "@/lib/format";
import { nowLocal } from "@/lib/time";
import { Flash } from "@/components/Flash";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";
import { BookingActions } from "../BookingActions";

export const metadata: Metadata = { title: "Reservas" };

type Search = { status?: string; periodo?: string; quadra?: string; ok?: string; erro?: string };

export default async function PanelBookings({ searchParams }: { searchParams: Promise<Search> }) {
  const owner = await requireOwner();
  const sp = await searchParams;
  const now = nowLocal();
  const status = sp.status && sp.status in BOOKING_STATUS ? (sp.status as BookingStatus) : undefined;
  const periodo = sp.periodo === "passadas" ? "passadas" : "proximas";

  const future: Prisma.BookingWhereInput = {
    OR: [{ date: { gt: now.date } }, { date: now.date, startHour: { gt: now.hour } }],
  };
  const past: Prisma.BookingWhereInput = {
    OR: [{ date: { lt: now.date } }, { date: now.date, startHour: { lte: now.hour } }],
  };

  const [courts, bookings] = await Promise.all([
    db.court.findMany({ where: { ownerId: owner.id }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.booking.findMany({
      where: {
        court: { ownerId: owner.id },
        ...(status && { status }),
        ...(sp.quadra && { courtId: sp.quadra }),
        ...(periodo === "passadas" ? past : future),
      },
      include: { court: { select: { name: true } }, user: { select: { name: true, email: true, phone: true } } },
      orderBy: periodo === "passadas" ? [{ date: "desc" }, { startHour: "desc" }] : [{ date: "asc" }, { startHour: "asc" }],
      take: 200,
    }),
  ]);

  const qs = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { status: sp.status, periodo: sp.periodo, quadra: sp.quadra, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/painel/reservas?${s}` : "/painel/reservas";
  };
  const returnTo = qs({});

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${
      active ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-400"
    }`;

  return (
    <>
      <Flash ok={sp.ok} erro={sp.erro} />
      <PageHeader title="Reservas" subtitle="Confirme, recuse ou cancele as reservas das suas quadras." />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href={qs({ periodo: undefined })} className={chip(periodo === "proximas")}>
          Próximas
        </Link>
        <Link href={qs({ periodo: "passadas" })} className={chip(periodo === "passadas")}>
          Passadas
        </Link>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <Link href={qs({ status: undefined })} className={chip(!status)}>
          Todas
        </Link>
        {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => (
          <Link key={s} href={qs({ status: s })} className={chip(status === s)}>
            {BOOKING_STATUS[s].short}
          </Link>
        ))}
        {courts.length > 1 && (
          <form className="ml-auto flex items-center gap-2" action="/painel/reservas">
            {sp.status && <input type="hidden" name="status" value={sp.status} />}
            {sp.periodo && <input type="hidden" name="periodo" value={sp.periodo} />}
            <select name="quadra" defaultValue={sp.quadra ?? ""} className={`${chip(!!sp.quadra)} border-0 focus:ring-2 focus:ring-brand-500 focus:outline-none`} aria-label="Filtrar por quadra">
              <option value="">Todas as quadras</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className={`${chip(false)} shrink-0`}>Aplicar</button>
          </form>
        )}
      </div>

      {bookings.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Quadra</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="align-middle">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-slate-500 capitalize">{formatWeekday(b.date)}</span> {formatDateShort(b.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatSlot(b.startHour)}</td>
                  <td className="px-4 py-3">{b.court.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.user.name}</p>
                    <p className="text-xs text-slate-500">{b.user.phone ?? b.user.email}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatMoney(b.priceCents)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3">
                    <BookingActions booking={b} returnTo={returnTo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nenhuma reserva encontrada" text="Mude os filtros acima para ver outras reservas." />
      )}
    </>
  );
}
