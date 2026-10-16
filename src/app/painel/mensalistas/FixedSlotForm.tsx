"use client";

import { useActionState } from "react";
import { createFixedSlot } from "@/app/actions/fixed-slots";
import { WEEKDAYS } from "@/lib/constants";
import { SubmitButton } from "@/components/buttons";
import { Alert, Field } from "@/components/ui";

type CourtOption = { id: string; name: string; openHour: number; closeHour: number };

export function FixedSlotForm({ courts }: { courts: CourtOption[] }) {
  const [state, action] = useActionState(createFixedSlot, undefined);
  const err = state?.fieldErrors ?? {};
  const v = state?.values ?? {};
  const minOpen = Math.min(...courts.map((c) => c.openHour));
  const maxClose = Math.max(...courts.map((c) => c.closeHour));
  const hours = Array.from({ length: maxClose - minOpen }, (_, i) => minOpen + i);

  return (
    <form action={action} className="card space-y-5 p-5" noValidate>
      <h2 className="font-semibold">Novo mensalista</h2>
      {state?.message && <Alert tone="error">{state.message}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome (pessoa ou time)" name="clientName" errors={err.clientName}>
          <input id="clientName" name="clientName" defaultValue={v.clientName} className="input" aria-invalid={!!err.clientName} placeholder="Ex.: Pelada dos Amigos" />
        </Field>
        <Field label="WhatsApp (opcional)" name="phone" errors={err.phone}>
          <input id="phone" name="phone" type="tel" defaultValue={v.phone} className="input" aria-invalid={!!err.phone} placeholder="(11) 99999-0000" />
        </Field>
      </div>

      <div className="space-y-5">
        {courts.length > 1 ? (
          <Field label="Quadra" name="courtId" errors={err.courtId}>
            <select id="courtId" name="courtId" defaultValue={v.courtId} className="input">
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="courtId" value={courts[0].id} />
        )}
        <div className="grid grid-cols-2 gap-5">
          <Field label="Dia da semana" name="weekday" errors={err.weekday}>
            <select id="weekday" name="weekday" defaultValue={v.weekday ?? "3"} className="input">
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Horário" name="startHour" errors={err.startHour}>
            <select id="startHour" name="startHour" defaultValue={v.startHour ?? "20"} className="input" aria-invalid={!!err.startHour}>
              {hours.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00 – {String(h + 1).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <SubmitButton pendingText="Salvando…">Cadastrar mensalista</SubmitButton>
    </form>
  );
}
