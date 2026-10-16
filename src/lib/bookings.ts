import "server-only";
import { db } from "./db";
import { ACTIVE_STATUSES } from "./constants";
import { isPastSlot, nowLocal, weekdayOf } from "./time";

export function slotKey(courtId: string, date: string, hour: number) {
  return `${courtId}:${date}:${hour}`;
}

/** O horário pertence a um mensalista (vale para todas as semanas)? */
export async function isFixedSlot(courtId: string, date: string, hour: number) {
  const n = await db.fixedSlot.count({ where: { courtId, weekday: weekdayOf(date), startHour: hour } });
  return n > 0;
}

export type SlotState = "free" | "taken" | "past" | "mine";

export type Slot = { hour: number; state: SlotState };

/** Grade de horários de uma quadra em um dia. */
export async function getDaySlots(
  court: { id: string; openHour: number; closeHour: number },
  date: string,
  viewerId?: string,
): Promise<Slot[]> {
  const [bookings, fixed] = await Promise.all([
    db.booking.findMany({
      where: { courtId: court.id, date, status: { in: ACTIVE_STATUSES } },
      select: { startHour: true, userId: true },
    }),
    db.fixedSlot.findMany({ where: { courtId: court.id, weekday: weekdayOf(date) }, select: { startHour: true } }),
  ]);
  const byHour = new Map(bookings.map((b) => [b.startHour, b.userId]));
  const fixedHours = new Set(fixed.map((f) => f.startHour));
  const now = nowLocal();

  const slots: Slot[] = [];
  for (let hour = court.openHour; hour < court.closeHour; hour++) {
    const owner = byHour.get(hour);
    let state: SlotState = "free";
    if (owner) state = owner === viewerId ? "mine" : "taken";
    else if (fixedHours.has(hour)) state = "taken";
    else if (isPastSlot(date, hour, now)) state = "past";
    slots.push({ hour, state });
  }
  return slots;
}

/** Transições permitidas por quem pode executá-las. */
export function canClientCancel(b: { status: string; date: string; startHour: number }) {
  return ACTIVE_STATUSES.includes(b.status as never) && !isPastSlot(b.date, b.startHour);
}

export function canOwnerDecide(b: { status: string; date: string; startHour: number }) {
  return b.status === "PENDING" && !isPastSlot(b.date, b.startHour);
}

export function canOwnerCancel(b: { status: string; date: string; startHour: number }) {
  return b.status === "CONFIRMED" && !isPastSlot(b.date, b.startHour);
}
