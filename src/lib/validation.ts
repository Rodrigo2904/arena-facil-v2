import { z } from "zod";
import { ROLES, SPORT_KEYS, UF_KEYS } from "./constants";
import { parseMoneyToCents } from "./format";

const trimmed = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`);

export const signupSchema = z.object({
  name: trimmed(100).min(2, "Informe seu nome."),
  email: z.string().trim().toLowerCase().email("Email inválido.").max(150),
  phone: trimmed(20)
    .regex(/^[\d\s()+-]*$/, "Telefone inválido.")
    .optional()
    .transform((v) => v || null),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres.").max(100),
  role: z.enum(ROLES).default("CLIENT"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
  password: z.string().min(1, "Informe a senha."),
});

const hour = z.coerce.number().int().min(0).max(24);

export const courtSchema = z
  .object({
    name: trimmed(100).min(2, "Informe o nome da quadra."),
    sport: z.enum(SPORT_KEYS, { errorMap: () => ({ message: "Escolha uma modalidade." }) }),
    description: trimmed(1000).default(""),
    address: trimmed(200).min(3, "Informe o endereço."),
    neighborhood: trimmed(100).default(""),
    city: trimmed(100).min(2, "Informe a cidade."),
    state: z.enum(UF_KEYS, { errorMap: () => ({ message: "Escolha o estado." }) }),
    zipCode: z
      .string()
      .trim()
      .default("")
      .transform((v) => v.replace(/\D/g, ""))
      .refine((v) => v === "" || v.length === 8, "CEP inválido. Ex.: 01234-567")
      .transform((v) => (v ? `${v.slice(0, 5)}-${v.slice(5)}` : "")),
    imageUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Use um link https:// para a foto.")
      .transform((v) => v || null),
    price: z.string().transform((v, ctx) => {
      const cents = parseMoneyToCents(v);
      if (cents === null) {
        ctx.addIssue({ code: "custom", message: "Preço inválido. Ex.: 120,00" });
        return z.NEVER;
      }
      if (cents <= 0) {
        ctx.addIssue({ code: "custom", message: "O preço precisa ser maior que zero." });
        return z.NEVER;
      }
      if (cents > 10_000_00) {
        ctx.addIssue({ code: "custom", message: "Preço alto demais." });
        return z.NEVER;
      }
      return cents;
    }),
    openHour: hour,
    closeHour: hour,
  })
  .refine((c) => c.closeHour > c.openHour, {
    message: "O horário de fechamento precisa ser depois da abertura.",
    path: ["closeHour"],
  });

export type FieldErrors = Record<string, string[] | undefined>;

export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
} | undefined;

export function formValues(formData: FormData) {
  const values: Record<string, string> = {};
  formData.forEach((v, k) => {
    if (typeof v === "string" && !k.startsWith("$") && k !== "password") values[k] = v;
  });
  return values;
}

export const fixedSlotSchema = z.object({
  courtId: z.string().min(1, "Escolha a quadra."),
  weekday: z.coerce.number().int().min(0).max(6),
  startHour: z.coerce.number().int().min(0).max(23),
  clientName: trimmed(100).min(2, "Informe o nome do mensalista ou do time."),
  phone: trimmed(20)
    .regex(/^[\d\s()+-]*$/, "Telefone inválido.")
    .optional()
    .transform((v) => v || null),
});
