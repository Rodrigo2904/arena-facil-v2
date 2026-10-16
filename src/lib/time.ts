// Todas as datas de reserva são datas locais de São Paulo no formato YYYY-MM-DD.
// Assim evitamos o clássico bug de fuso em que a reserva "muda de dia".

export const TIME_ZONE = "America/Sao_Paulo";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

/** Data (YYYY-MM-DD) e hora atuais em São Paulo. */
export function nowLocal(now = new Date()) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(now).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

export function todayLocal() {
  return nowLocal().date;
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Soma dias a uma data YYYY-MM-DD (aritmética em UTC ao meio-dia, imune a horário de verão). */
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function diffDays(from: string, to: string) {
  const a = new Date(`${from}T12:00:00Z`).getTime();
  const b = new Date(`${to}T12:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function monthRange(date: string) {
  const [y, m] = date.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { start, end: addDays(next, -1) };
}

/** Uma reserva que começa em (date, hour) já passou? */
export function isPastSlot(date: string, hour: number, now = nowLocal()) {
  return date < now.date || (date === now.date && hour <= now.hour);
}

/** Dia da semana de uma data YYYY-MM-DD: 0 = domingo ... 6 = sábado. */
export function weekdayOf(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}
