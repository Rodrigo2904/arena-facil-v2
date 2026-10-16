import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getDaySlots } from "@/lib/bookings";
import { MAX_DAYS_AHEAD, sportInfo } from "@/lib/constants";
import { formatDateLong, formatDateShort, formatHour, formatMoney, formatSlot, formatWeekday, mapLinks } from "@/lib/format";
import { addDays, diffDays, isValidDateString, todayLocal } from "@/lib/time";
import { createBooking } from "@/app/actions/bookings";
import { CourtCover } from "@/components/CourtCard";
import { Flash } from "@/components/Flash";
import { SubmitButton } from "@/components/buttons";
import { Alert, BackLink } from "@/components/ui";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ data?: string; erro?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const court = await db.court.findUnique({ where: { id: (await params).id }, select: { name: true } });
  return { title: court?.name ?? "Quadra" };
}

export default async function CourtPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const court = await db.court.findUnique({
    where: { id },
    include: { owner: { select: { name: true, phone: true } } },
  });
  if (!court) notFound();

  const user = await getCurrentUser();
  const today = todayLocal();
  const requested = sp.data && isValidDateString(sp.data) ? sp.data : today;
  const offset = diffDays(today, requested);
  const date = offset < 0 || offset > MAX_DAYS_AHEAD ? today : requested;

  const slots = await getDaySlots(court, date, user?.id);
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const sport = sportInfo(court.sport);
  const isOwnCourt = user?.id === court.ownerId;
  const freeCount = slots.filter((s) => s.state === "free").length;
  const maps = mapLinks(court);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackLink href="/quadras">Voltar para as quadras</BackLink>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="min-w-0">
          <CourtCover court={court} className="h-64 w-full rounded-2xl sm:h-80" />
          <div className="mt-5">
            <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
              {sport.emoji} {sport.label}
            </span>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{court.name}</h1>
            <p className="mt-2 text-slate-600">
              📍 {court.address}
              {court.neighborhood && ` — ${court.neighborhood}`}, {court.city}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-lg bg-brand-50 px-3 py-1.5 font-semibold text-brand-700">
                {formatMoney(court.priceCents)} / hora
              </span>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700">
                🕒 {formatHour(court.openHour)} às {formatHour(court.closeHour)}
              </span>
              <a
                href={maps.google}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white px-3 py-1.5 font-semibold text-brand-700 ring-1 ring-slate-200 ring-inset hover:ring-brand-500"
              >
                🧭 Como chegar
              </a>
            </div>
            {court.description && <p className="mt-5 leading-relaxed whitespace-pre-line text-slate-700">{court.description}</p>}
            {court.owner.phone && user && (
              <p className="mt-5 text-sm text-slate-600">
                Responsável: <strong>{court.owner.name}</strong> · {court.owner.phone}
              </p>
            )}
          </div>

        </div>

        <section className="card h-fit min-w-0 p-5 sm:p-6 lg:row-span-2" aria-labelledby="agenda">
          <h2 id="agenda" className="text-lg font-bold">
            Escolha dia e horário
          </h2>

          <Flash erro={sp.erro} />

          {!court.active ? (
            <div className="mt-4">
              <Alert tone="info">Esta quadra está temporariamente indisponível para reservas.</Alert>
            </div>
          ) : (
            <>
              <nav className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2" aria-label="Dias">
                {days.map((d) => {
                  const selected = d === date;
                  return (
                    <Link
                      key={d}
                      href={`/quadras/${court.id}?data=${d}`}
                      scroll={false}
                      aria-current={selected ? "date" : undefined}
                      className={`flex min-w-16 flex-col items-center rounded-xl px-3 py-2 text-sm ring-1 ring-inset ${
                        selected ? "bg-brand-600 text-white ring-brand-600" : "bg-white ring-slate-200 hover:ring-brand-500"
                      }`}
                    >
                      <span className={`text-xs capitalize ${selected ? "text-brand-100" : "text-slate-500"}`}>
                        {d === today ? "Hoje" : formatWeekday(d)}
                      </span>
                      <span className="font-semibold">{formatDateShort(d)}</span>
                    </Link>
                  );
                })}
              </nav>

              <form action={`/quadras/${court.id}`} className="mt-2 flex items-center gap-2 text-sm">
                <label htmlFor="data" className="shrink-0 text-slate-600">
                  Outra data:
                </label>
                <input
                  id="data"
                  type="date"
                  name="data"
                  min={today}
                  max={addDays(today, MAX_DAYS_AHEAD)}
                  defaultValue={date}
                  className="input min-w-0 flex-1 py-1.5 sm:w-auto sm:flex-none"
                />
                <button className="btn btn-secondary btn-sm shrink-0">Ver</button>
              </form>

              <p className="mt-5 mb-3 text-sm text-slate-600">
                <strong className="text-slate-900">{formatDateLong(date)}</strong> ·{" "}
                {freeCount ? `${freeCount} horário${freeCount > 1 ? "s" : ""} livre${freeCount > 1 ? "s" : ""}` : "sem horários livres"}
              </p>

              {isOwnCourt && (
                <div className="mb-3">
                  <Alert tone="info">
                    Esta é uma quadra sua. Gerencie as reservas pelo{" "}
                    <Link href="/painel/reservas" className="font-semibold underline">
                      painel
                    </Link>
                    .
                  </Alert>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slots.map((slot) =>
                  slot.state === "free" && !isOwnCourt ? (
                    <form key={slot.hour} action={createBooking}>
                      <input type="hidden" name="courtId" value={court.id} />
                      <input type="hidden" name="date" value={date} />
                      <input type="hidden" name="hour" value={slot.hour} />
                      <SubmitButton
                        className="w-full rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200 ring-inset transition hover:bg-emerald-600 hover:text-white"
                        pendingText="Reservando…"
                        confirm={
                          user
                            ? `Reservar ${court.name}\n${formatDateLong(date)}, ${formatSlot(slot.hour)}\nValor: ${formatMoney(court.priceCents)}`
                            : undefined
                        }
                      >
                        {formatSlot(slot.hour)}
                      </SubmitButton>
                    </form>
                  ) : (
                    <div
                      key={slot.hour}
                      className={`rounded-xl px-3 py-2.5 text-center text-sm ring-1 ring-inset ${
                        slot.state === "mine"
                          ? "bg-sky-50 font-semibold text-sky-800 ring-sky-200"
                          : slot.state === "free"
                            ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                            : "bg-slate-50 text-slate-400 line-through ring-slate-200"
                      }`}
                      title={{ mine: "Sua reserva", taken: "Ocupado", past: "Horário encerrado", free: "Livre" }[slot.state]}
                    >
                      {formatSlot(slot.hour)}
                    </div>
                  ),
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>
                  <span className="mr-1 inline-block size-2.5 rounded-full bg-emerald-400" /> Livre
                </span>
                <span>
                  <span className="mr-1 inline-block size-2.5 rounded-full bg-slate-300" /> Ocupado / encerrado
                </span>
                <span>
                  <span className="mr-1 inline-block size-2.5 rounded-full bg-sky-400" /> Sua reserva
                </span>
              </div>

              {!user && (
                <p className="mt-4 text-sm text-slate-600">
                  Ao escolher um horário você será levado para entrar ou criar sua conta.
                </p>
              )}
            </>
          )}
        </section>

        <section className="min-w-0" aria-labelledby="localizacao">
          <h2 id="localizacao" className="mb-3 text-lg font-bold">
            Localização
          </h2>
          <div className="card overflow-hidden">
            <iframe
              src={maps.embed}
              title={`Mapa: ${court.name}`}
              className="h-56 w-full border-0 sm:h-64"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="grid grid-cols-2 gap-3 p-4">
              <a href={maps.google} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Google Maps
              </a>
              <a href={maps.waze} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                Waze
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
