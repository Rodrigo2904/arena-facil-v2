"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { ACTIVE_STATUSES, WEEKDAYS } from "@/lib/constants";
import { formatDateShort } from "@/lib/format";
import { nowLocal, weekdayOf } from "@/lib/time";
import { fixedSlotSchema, formValues, type FormState } from "@/lib/validation";

export async function createFixedSlot(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const values = formValues(formData);

  const parsed = fixedSlotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  const data = parsed.data;

  const court = await db.court.findFirst({ where: { id: data.courtId, ownerId: owner.id } });
  if (!court) return { message: "Quadra não encontrada.", values };
  if (data.startHour < court.openHour || data.startHour >= court.closeHour) {
    return { fieldErrors: { startHour: ["Fora do horário de funcionamento da quadra."] }, values };
  }

  // Reservas avulsas já marcadas nesse dia da semana/hora precisam ser resolvidas antes
  const now = nowLocal();
  const conflicts = (
    await db.booking.findMany({
      where: {
        courtId: court.id,
        startHour: data.startHour,
        status: { in: ACTIVE_STATUSES },
        OR: [{ date: { gt: now.date } }, { date: now.date, startHour: { gt: now.hour } }],
      },
      select: { date: true },
      orderBy: { date: "asc" },
    })
  ).filter((b) => weekdayOf(b.date) === data.weekday);
  if (conflicts.length) {
    const n = conflicts.length;
    return {
      message: `Já existe${n > 1 ? `m ${n} reservas` : " 1 reserva"} nesse horário (a próxima em ${formatDateShort(conflicts[0].date)}). Recuse ou cancele em "Reservas" antes de cadastrar o mensalista.`,
      values,
    };
  }

  try {
    await db.fixedSlot.create({ data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { message: `Já tem mensalista na ${court.name} às ${data.startHour}h de ${WEEKDAYS[data.weekday].toLowerCase()}.`, values };
    }
    throw e;
  }

  revalidatePath(`/quadras/${court.id}`);
  revalidatePath("/painel", "layout");
  redirect("/painel/mensalistas?ok=mensalista-criado");
}

export async function deleteFixedSlot(formData: FormData) {
  const owner = await requireOwner();
  const slot = await db.fixedSlot.findFirst({
    where: { id: String(formData.get("id")), court: { ownerId: owner.id } },
  });
  if (!slot) redirect("/painel/mensalistas");

  await db.fixedSlot.delete({ where: { id: slot.id } });

  revalidatePath(`/quadras/${slot.courtId}`);
  revalidatePath("/painel", "layout");
  redirect("/painel/mensalistas?ok=mensalista-removido");
}
