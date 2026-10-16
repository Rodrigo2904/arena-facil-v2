"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { formValues, loginSchema, signupSchema, type FormState } from "@/lib/validation";

/** Aceita só caminhos internos, para evitar redirecionamento para sites externos. */
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : fallback;
}

// Hash usado quando o email não existe, para o login levar o mesmo tempo
// e não revelar quais emails estão cadastrados.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.JKa1i6K5ZJxj1KoV7ZOvlZUs2H5i";

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values: formValues(formData) };
  }
  const { name, email, phone, password, role } = parsed.data;

  const exists = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) {
    return { fieldErrors: { email: ["Este email já está cadastrado."] }, values: formValues(formData) };
  }

  const user = await db.user.create({
    data: { name, email, phone, role, passwordHash: await bcrypt.hash(password, 10) },
  });
  await createSession({ userId: user.id, role: user.role as "CLIENT" | "OWNER", name: user.name });
  redirect(user.role === "OWNER" ? "/painel?boas-vindas=1" : safeNext(formData.get("next"), "/quadras"));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values: formValues(formData) };
  }
  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) {
    return { message: "Email ou senha inválidos.", values: formValues(formData) };
  }

  await createSession({ userId: user.id, role: user.role as "CLIENT" | "OWNER", name: user.name });
  redirect(safeNext(formData.get("next"), user.role === "OWNER" ? "/painel" : "/quadras"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
