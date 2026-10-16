export const ROLES = ["CLIENT", "OWNER"] as const;
export type Role = (typeof ROLES)[number];

export const SPORTS = {
  society: { label: "Society", emoji: "⚽", gradient: "from-emerald-500 to-green-700" },
  futsal: { label: "Futsal", emoji: "🥅", gradient: "from-sky-500 to-blue-700" },
  campo: { label: "Campo", emoji: "🏟️", gradient: "from-lime-500 to-green-800" },
  volei: { label: "Vôlei", emoji: "🏐", gradient: "from-amber-400 to-orange-600" },
  beach_tennis: { label: "Beach Tennis", emoji: "🎾", gradient: "from-yellow-400 to-amber-600" },
  padel: { label: "Padel", emoji: "🏓", gradient: "from-fuchsia-500 to-purple-700" },
  tenis: { label: "Tênis", emoji: "🎾", gradient: "from-orange-500 to-red-600" },
  basquete: { label: "Basquete", emoji: "🏀", gradient: "from-orange-500 to-rose-700" },
} as const;
export type Sport = keyof typeof SPORTS;
export const SPORT_KEYS = Object.keys(SPORTS) as [Sport, ...Sport[]];

export function sportInfo(sport: string) {
  return SPORTS[sport as Sport] ?? { label: sport, emoji: "🏅", gradient: "from-slate-500 to-slate-700" };
}

export const BOOKING_STATUS = {
  PENDING: { label: "Aguardando confirmação", short: "Pendente", className: "bg-amber-100 text-amber-800 ring-amber-200" },
  CONFIRMED: { label: "Confirmada", short: "Confirmada", className: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
  REJECTED: { label: "Recusada pelo dono", short: "Recusada", className: "bg-rose-100 text-rose-800 ring-rose-200" },
  CANCELLED: { label: "Cancelada", short: "Cancelada", className: "bg-slate-100 text-slate-600 ring-slate-200" },
} as const;
export type BookingStatus = keyof typeof BOOKING_STATUS;

/** Status em que a reserva ocupa o horário. */
export const ACTIVE_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"];

/** Quantos dias à frente o cliente pode reservar. */
export const MAX_DAYS_AHEAD = 60;

/** Índice = dia da semana (0 = domingo), igual a weekdayOf(). */
export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;
export const UF_KEYS = UFS as unknown as [string, ...string[]];
