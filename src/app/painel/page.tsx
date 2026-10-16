import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { formatDateLong, formatDateShort, formatMoney, formatSlot, formatWeekday, whatsappUrl } from "@/lib/format";
import { addDays, nowLocal, weekdayOf } from "@/lib/time";
import { Flash } from "@/components/Flash";
import { Alert, EmptyState, PageHeader } from "@/components/ui";
import { BookingActions } from "./BookingActions";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PanelHome({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; "boas-vindas"?: string }>;
}) {
  const owner = await requireOwner();
  const sp = await searchParams;
  const now = nowLocal();
  const today = now.date;
  const weekEnd = addDays(today, 6);

  const mine = { court: { ownerId: owner.id } };
  const future = { OR: [{ date: { gt: today } }, { date: today, startHour: { gt: now.hour } }] };

  const [courtCount, pending, upcoming, fixedSlots] = await Promise.all([
    db.court.count({ where: { ownerId: owner.id } }),
    db.booking.findMany({
      where: { ...mine, ...future, status: "PENDING" },
      include: { court: { select: { name: true } }, user: { select: { name: true, phone: true } } },
      orderBy: [{ date: "asc" }, { startHour: "asc" }],
    }),
    db.booking.findMany({
      where: { ...mine, ...future, status: "CONFIRMED", date: { lte: weekEnd } },
      include: { court: { select: { name: true } }, user: { select: { name: true, phone: true } } },
      orderBy: [{ date: "asc" }, { startHour: "asc" }],
    }),
    db.fixedSlot.findMany({
      where: { court: { ownerId: owner.id, active: true } },
      include: { court: { select: { name: true } } },
    }),
  ]);

  if (courtCount === 0) {
    return (
      <>
        {sp["boas-vindas"] && (
          <div className="mb-6">
            <Alert tone="success">Conta criada! Cadastre sua primeira quadra para começar a receber reservas.</Alert>
          </div>
        )}
        <EmptyState
          title="Você ainda não tem quadras cadastradas"
          text="Cadastre sua quadra com endereço, preço e horário de funcionamento. Ela aparece na hora para os clientes."
          action={
            <Link href="/painel/quadras/nova" className="btn btn-primary">
              Cadastrar primeira quadra
            </Link>
          }
        />
      </>
    );
  }

  // Próximos jogos (reservas confirmadas + mensalistas) agrupados por dia
  type Game = { key: string; hour: number; name: string; court: string; fixed: boolean };
  const byDay = new Map<string, Game[]>();
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const games: Game[] = [
      ...upcoming
        .filter((b) => b.date === date)
        .map((b) => ({ key: b.id, hour: b.startHour, name: b.user.name, court: b.court.name, fixed: false })),
      ...fixedSlots
        .filter((f) => f.weekday === weekdayOf(date) && !(date === today && f.startHour <= now.hour))
        .map((f) => ({ key: `${f.id}:${date}`, hour: f.startHour, name: f.clientName, court: f.court.name, fixed: true })),
    ].sort((a, b) => a.hour - b.hour);
    if (games.length) byDay.set(date, games);
  }

  const dayLabel = (date: string) =>
    date === today ? "Hoje" : date === addDays(today, 1) ? "Amanhã" : `${formatWeekday(date)}, ${formatDateShort(date)}`;

  return (
    <>
      <Flash ok={sp.ok} erro={sp.erro} />
      <PageHeader title={`Olá, ${owner.name.split(" ")[0]}`} subtitle={formatDateLong(today)} />

      <section aria-labelledby="pedidos">
        <h2 id="pedidos" className="mb-3 text-lg font-semibold">
          {pending.length ? `Pedidos para responder (${pending.length})` : "Pedidos para responder"}
        </h2>
        {pending.length ? (
          <ul className="space-y-3">
            {pending.map((b) => {
              const wa = whatsappUrl(
                b.user.phone,
                `Olá ${b.user.name.split(" ")[0]}! Sobre sua reserva na ${b.court.name}, ${dayLabel(b.date).toLowerCase()} às ${formatSlot(b.startHour)}:`,
              );
              return (
                <li key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-4 ring-2 ring-amber-200">
                  <div>
                    <p className="text-base font-semibold">
                      {dayLabel(b.date)} · {formatSlot(b.startHour)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {b.user.name} · {b.court.name} · {formatMoney(b.priceCents)}
                    </p>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-700 hover:underline">
                        💬 WhatsApp {b.user.phone}
                      </a>
                    ) : (
                      b.user.phone && <p className="text-sm text-slate-500">📱 {b.user.phone}</p>
                    )}
                  </div>
                  <BookingActions booking={b} returnTo="/painel" />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="card p-6 text-center text-sm text-slate-500">Nenhum pedido esperando. Tudo em dia 👌</p>
        )}
      </section>

      <section aria-labelledby="proximos" className="mt-10">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 id="proximos" className="text-lg font-semibold">
            Próximos jogos
          </h2>
          <Link href="/painel/reservas" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todas as reservas
          </Link>
        </div>
        {byDay.size ? (
          <div className="card divide-y divide-slate-100">
            {[...byDay].map(([date, list]) => (
              <div key={date} className="p-4">
                <p className="mb-2 text-sm font-semibold text-slate-900 first-letter:uppercase">{dayLabel(date)}</p>
                <ul className="space-y-1">
                  {list.map((g) => (
                    <li key={g.key} className="flex items-center gap-3 text-sm">
                      <span className="font-mono font-semibold">{String(g.hour).padStart(2, "0")}h</span>
                      <span className="flex-1 truncate">
                        {g.name} · <span className="text-slate-500">{g.court}</span>
                      </span>
                      {g.fixed && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">mensalista</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="card p-6 text-center text-sm text-slate-500">Nenhum jogo nos próximos 7 dias.</p>
        )}
      </section>
    </>
  );
}
