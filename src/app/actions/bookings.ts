"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, requireOwner, requireUser } from "@/lib/auth";
import { canClientCancel, canOwnerCancel, canOwnerDecide, isFixedSlot, slotKey } from "@/lib/bookings";
import { MAX_DAYS_AHEAD } from "@/lib/constants";
import { diffDays, isPastSlot, isValidDateString, todayLocal } from "@/lib/time";

function str(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export async function createBooking(formData: FormData) {
  const courtId = str(formData, "courtId");
  const date = str(formData, "date");
  const hour = Number(str(formData, "hour"));
  function back(erro: string): never {
    redirect(`/quadras/${encodeURIComponent(courtId)}?data=${encodeURIComponent(date)}&erro=${erro}`);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/entrar?next=${encodeURIComponent(`/quadras/${courtId}?data=${date}`)}`);
  }

  const court = await db.court.findUnique({ where: { id: courtId } });
  if (!court || !court.active) redirect("/quadras?erro=quadra-indisponivel");
  if (court.ownerId === user.id) back("propria-quadra");

  if (!isValidDateString(date) || !Number.isInteger(hour)) back("horario-invalido");
  if (hour < court.openHour || hour >= court.closeHour) back("horario-invalido");
  if (isPastSlot(date, hour)) back("horario-passado");
  if (diffDays(todayLocal(), date) > MAX_DAYS_AHEAD) back("muito-longe");
  if (await isFixedSlot(courtId, date, hour)) back("ocupado");

  try {
    await db.booking.create({
      data: {
        courtId,
        userId: user.id,
        date,
        startHour: hour,
        priceCents: court.priceCents,
        slotKey: slotKey(courtId, date, hour),
      },
    });
  } catch (e) {
    // Violação do índice único: alguém reservou o horário ao mesmo tempo
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") back("ocupado");
    throw e;
  }

  revalidatePath(`/quadras/${courtId}`);
  revalidatePath("/painel", "layout");
  redirect("/minhas-reservas?ok=reservada");
}

export async function cancelMyBooking(formData: FormData) {
  const user = await requireUser("/minhas-reservas");
  const booking = await db.booking.findFirst({ where: { id: str(formData, "bookingId"), userId: user.id } });
  if (!booking || !canClientCancel(booking)) redirect("/minhas-reservas?erro=nao-cancelavel");

  await db.booking.updateMany({
    where: { id: booking.id, status: booking.status },
    data: { status: "CANCELLED", slotKey: null },
  });

  revalidatePath("/minhas-reservas");
  revalidatePath("/painel", "layout");
  redirect("/minhas-reservas?ok=cancelada");
}

const OWNER_ACTIONS = {
  confirm: { from: "PENDING", to: "CONFIRMED", allowed: canOwnerDecide },
  reject: { from: "PENDING", to: "REJECTED", allowed: canOwnerDecide },
  cancel: { from: "CONFIRMED", to: "CANCELLED", allowed: canOwnerCancel },
} as const;

export async function ownerUpdateBooking(formData: FormData) {
  const owner = await requireOwner();
  const action = OWNER_ACTIONS[str(formData, "action") as keyof typeof OWNER_ACTIONS];
  const returnTo = str(formData, "returnTo").startsWith("/painel") ? str(formData, "returnTo") : "/painel/reservas";
  const withParam = (p: string) => `${returnTo}${returnTo.includes("?") ? "&" : "?"}${p}`;

  const booking = await db.booking.findFirst({
    where: { id: str(formData, "bookingId"), court: { ownerId: owner.id } },
  });
  if (!action || !booking || !action.allowed(booking)) redirect(withParam("erro=acao-invalida"));

  // O filtro por status torna a transição atômica (evita confirmar algo que acabou de ser cancelado)
  const { count } = await db.booking.updateMany({
    where: { id: booking.id, status: action.from },
    data: { status: action.to, ...(action.to === "CONFIRMED" ? {} : { slotKey: null }) },
  });
  if (count === 0) redirect(withParam("erro=acao-invalida"));

  revalidatePath("/painel", "layout");
  revalidatePath("/minhas-reservas");
  revalidatePath(`/quadras/${booking.courtId}`);
  redirect(withParam(`ok=${str(formData, "action")}`));
}
