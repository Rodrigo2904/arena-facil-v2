"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import { SubmitButton } from "@/components/buttons";
import { Alert, Field } from "@/components/ui";

export function SignupForm({ next, role }: { next?: string; role: "CLIENT" | "OWNER" }) {
  const [state, action] = useActionState(signup, undefined);
  const err = state?.fieldErrors ?? {};
  const v = state?.values ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="role" value={role} />
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <Field label="Nome completo" name="name" errors={err.name}>
        <input id="name" name="name" autoComplete="name" className="input" defaultValue={v.name} aria-invalid={!!err.name} />
      </Field>
      <Field label="Email" name="email" errors={err.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input"
          defaultValue={v.email}
          aria-invalid={!!err.email}
        />
      </Field>
      <Field label="WhatsApp (opcional)" name="phone" errors={err.phone} hint={role === "OWNER" ? "Seus clientes usam para falar com você." : "O dono da quadra usa para falar com você."}>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          className="input"
          defaultValue={v.phone}
          aria-invalid={!!err.phone}
        />
      </Field>
      <Field label="Senha" name="password" errors={err.password} hint="Mínimo de 6 caracteres.">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="input"
          aria-invalid={!!err.password}
        />
      </Field>

      <SubmitButton className="btn btn-primary w-full" pendingText="Criando conta…">
        Criar conta
      </SubmitButton>
    </form>
  );
}
