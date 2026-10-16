"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { SubmitButton } from "@/components/buttons";
import { Alert, Field } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(login, undefined);
  const err = state?.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state?.message && <Alert tone="error">{state.message}</Alert>}
      <Field label="Email" name="email" errors={err.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input"
          defaultValue={state?.values?.email}
          aria-invalid={!!err.email}
          required
        />
      </Field>
      <Field label="Senha" name="password" errors={err.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input"
          aria-invalid={!!err.password}
          required
        />
      </Field>
      <SubmitButton className="btn btn-primary w-full" pendingText="Entrando…">
        Entrar
      </SubmitButton>
    </form>
  );
}
