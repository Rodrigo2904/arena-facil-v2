"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { courtSchema, formValues, type FormState } from "@/lib/validation";

export async function saveCourt(_prev: FormState, formData: FormData): Promise<FormState> {
  const owner = await requireOwner();
  const id = formData.get("id");

  const parsed = courtSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values: formValues(formData) };
  }
  const { price, ...rest } = parsed.data;
  const data = { ...rest, priceCents: price };

  if (typeof id === "string" && id) {
    const { count } = await db.court.updateMany({ where: { id, ownerId: owner.id }, data });
    if (count === 0) return { message: "Quadra não encontrada." };
    revalidatePath(`/quadras/${id}`);
  } else {
    await db.court.create({ data: { ...data, ownerId: owner.id } });
  }

  revalidatePath("/quadras");
  revalidatePath("/painel", "layout");
  redirect(`/painel/quadras?ok=${id ? "atualizada" : "criada"}`);
}

export async function toggleCourtActive(formData: FormData) {
  const owner = await requireOwner();
  const court = await db.court.findFirst({ where: { id: String(formData.get("id")), ownerId: owner.id } });
  if (!court) redirect("/painel/quadras?erro=nao-encontrada");

  await db.court.update({ where: { id: court.id }, data: { active: !court.active } });

  revalidatePath("/quadras");
  revalidatePath(`/quadras/${court.id}`);
  revalidatePath("/painel", "layout");
  redirect(`/painel/quadras?ok=${court.active ? "pausada" : "ativada"}`);
}

export async function deleteCourt(formData: FormData) {
  const owner = await requireOwner();
  const court = await db.court.findFirst({
    where: { id: String(formData.get("id")), ownerId: owner.id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!court) redirect("/painel/quadras?erro=nao-encontrada");
  // Quadras com histórico não são apagadas, para não perder o faturamento; o dono pode pausá-las.
  if (court._count.bookings > 0) redirect("/painel/quadras?erro=tem-reservas");

  await db.court.delete({ where: { id: court.id } });

  revalidatePath("/quadras");
  revalidatePath("/painel", "layout");
  redirect("/painel/quadras?ok=excluida");
}
