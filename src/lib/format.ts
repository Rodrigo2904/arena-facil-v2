const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatMoney(cents: number) {
  return money.format(cents / 100);
}

/** "12,50" | "12.50" | "1.234,56" -> centavos. Retorna null se inválido. */
export function parseMoneyToCents(input: string): number | null {
  let s = input.trim().replace(/\s|R\$/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" });
const longFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const shortFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });

function asUtcNoon(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

export function formatDateLong(date: string) {
  const s = longFmt.format(asUtcNoon(date));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatDateShort(date: string) {
  return shortFmt.format(asUtcNoon(date));
}

export function formatWeekday(date: string) {
  return weekdayFmt.format(asUtcNoon(date)).replace(".", "");
}

export function formatHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatSlot(hour: number) {
  return `${formatHour(hour)} – ${formatHour(hour + 1)}`;
}

/** Link wa.me para um telefone brasileiro; null se o número não parece válido. */
export function whatsappUrl(phone: string | null | undefined, text?: string) {
  let digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (digits.length < 12 || digits.length > 13) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Links de mapa a partir do endereço (não precisa de coordenadas nem de chave de API). */
export function mapLinks(court: { address: string; neighborhood: string; city: string; state?: string; zipCode?: string }) {
  const q = encodeURIComponent(
    [court.address, court.neighborhood, cityState(court), court.zipCode, "Brasil"].filter(Boolean).join(", "),
  );
  return {
    embed: `https://maps.google.com/maps?q=${q}&z=16&output=embed`,
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    waze: `https://waze.com/ul?q=${q}&navigate=yes`,
  };
}

/** "São Paulo - SP" (ou só a cidade, em quadras antigas sem estado). */
export function cityState(court: { city: string; state?: string }) {
  return court.state ? `${court.city} - ${court.state}` : court.city;
}
