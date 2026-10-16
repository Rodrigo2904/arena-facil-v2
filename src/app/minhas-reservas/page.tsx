import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canClientCancel } from "@/lib/bookings";
import { BOOKING_STATUS, type BookingStatus, sportInfo } from "@/lib/constants";
import { formatDateLong, formatMoney, formatSlot } from "@/lib/format";
import { isPastSlot } from "@/lib/time";
import { cancelMyBooking } from "@/app/actions/bookings";
import { Flash } from "@/components/Flash";
import { SubmitButton } from "@/components/buttons";
import { EmptyState, PageHeader, StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Minhas reservas" };

export default async function MyBookingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const user = await requireUser("/minhas-reservas");
  const sp = await searchParams;

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { court: { select: { id: true, name: true, sport: true, address: true, city: true } } },
    orderBy: [{ date: "asc" }, { startHour: "asc" }],
  });

  const upcoming = bookings.filter((b) => !isPastSlot(b.date, b.startHour) && b.status !== "CANCELLED" && b.status !== "REJECTED");
  const history = bookings.filter((b) => !upcoming.includes(b)).reverse();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Flash ok={sp.ok} erro={sp.erro} />
      <PageHeader
        title="Minhas reservas"
        actions={
          <Link href="/quadras" className="btn btn-primary">
            Nova reserva
          </Link>
        }
      />

      <h2 className="mb-3 font-semibold text-slate-700">Próximas</h2>
      {upcoming.length ? (
        <ul className="space-y-3">
          {upcoming.map((b) => (
            <li key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-2xl" aria-hidden>
                  {sportInfo(b.court.sport).emoji}
                </div>
                <div>
                  <Link href={`/quadras/${b.court.id}`} className="font-semibold hover:text-brand-700">
                    {b.court.name}
                  </Link>
                  <p className="text-sm text-slate-600">
                    {formatDateLong(b.date)} · {formatSlot(b.startHour)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {b.court.address}, {b.court.city} · {formatMoney(b.priceCents)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span title={BOOKING_STATUS[b.status as BookingStatus]?.label}>
                  <StatusBadge status={b.status} />
                </span>
                {canClientCancel(b) && (
                  <form action={cancelMyBooking}>
                    <input type="hidden" name="bookingId" value={b.id} />
                    <SubmitButton className="btn btn-danger btn-sm" pendingText="Cancelando…" confirm="Cancelar esta reserva?">
                      Cancelar
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Nenhuma reserva marcada"
          text="Que tal marcar o próximo jogo?"
          action={
            <Link href="/quadras" className="btn btn-primary">
              Encontrar quadra
            </Link>
          }
        />
      )}

      {history.length > 0 && (
        <>
          <h2 className="mt-10 mb-3 font-semibold text-slate-700">Histórico</h2>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Quadra</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium">{b.court.name}</td>
                    <td className="px-4 py-3">{formatDateLong(b.date)}</td>
                    <td className="px-4 py-3">{formatSlot(b.startHour)}</td>
                    <td className="px-4 py-3">{formatMoney(b.priceCents)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
