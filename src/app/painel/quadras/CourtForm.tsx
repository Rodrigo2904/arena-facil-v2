"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCourt } from "@/app/actions/courts";
import { SPORTS, UFS } from "@/lib/constants";
import { CourtCover } from "@/components/CourtCard";
import { SubmitButton } from "@/components/buttons";
import { Alert, Field } from "@/components/ui";

export type CourtFormValues = {
  id?: string;
  name: string;
  sport: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  imageUrl: string;
  price: string;
  openHour: string;
  closeHour: string;
};

const HOURS = Array.from({ length: 25 }, (_, h) => h);

export function CourtForm({ initial }: { initial: CourtFormValues }) {
  const [state, action] = useActionState(saveCourt, undefined);
  const err = state?.fieldErrors ?? {};
  const v = { ...initial, ...state?.values };
  const [preview, setPreview] = useState({ name: v.name, sport: v.sport, imageUrl: v.imageUrl });

  return (
    <form
      action={action}
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
      noValidate
      onChange={(e) => {
        const f = e.currentTarget.elements;
        const get = (n: string) => (f.namedItem(n) as HTMLInputElement | null)?.value ?? "";
        setPreview({ name: get("name"), sport: get("sport"), imageUrl: get("imageUrl") });
      }}
    >
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="card space-y-5 p-6">
        {state?.message && <Alert tone="error">{state.message}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nome da quadra" name="name" errors={err.name}>
            <input id="name" name="name" defaultValue={v.name} className="input" aria-invalid={!!err.name} placeholder="Ex.: Arena Central" />
          </Field>
          <Field label="Modalidade" name="sport" errors={err.sport}>
            <select id="sport" name="sport" defaultValue={v.sport} className="input" aria-invalid={!!err.sport}>
              {Object.entries(SPORTS).map(([key, s]) => (
                <option key={key} value={key}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descrição" name="description" errors={err.description} hint="Conte o que a quadra oferece: grama sintética, vestiário, estacionamento, bar…">
          <textarea id="description" name="description" rows={4} defaultValue={v.description} className="input" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
          <Field label="CEP (opcional)" name="zipCode" errors={err.zipCode}>
            <input
              id="zipCode"
              name="zipCode"
              inputMode="numeric"
              maxLength={9}
              defaultValue={v.zipCode}
              className="input"
              aria-invalid={!!err.zipCode}
              placeholder="00000-000"
            />
          </Field>
          <Field label="Endereço" name="address" errors={err.address}>
            <input id="address" name="address" defaultValue={v.address} className="input" aria-invalid={!!err.address} placeholder="Rua, número" />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_1fr_7rem]">
          <Field label="Bairro" name="neighborhood" errors={err.neighborhood}>
            <input id="neighborhood" name="neighborhood" defaultValue={v.neighborhood} className="input" />
          </Field>
          <Field label="Cidade" name="city" errors={err.city}>
            <input id="city" name="city" defaultValue={v.city} className="input" aria-invalid={!!err.city} />
          </Field>
          <Field label="Estado" name="state" errors={err.state}>
            <select id="state" name="state" defaultValue={v.state} className="input" aria-invalid={!!err.state}>
              <option value="">UF</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Abre às" name="openHour" errors={err.openHour}>
            <select id="openHour" name="openHour" defaultValue={v.openHour} className="input">
              {HOURS.slice(0, 24).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha às" name="closeHour" errors={err.closeHour}>
            <select id="closeHour" name="closeHour" defaultValue={v.closeHour} className="input" aria-invalid={!!err.closeHour}>
              {HOURS.slice(1).map((h) => (
                <option key={h} value={h}>
                  {h === 24 ? "00:00 (meia-noite)" : `${String(h).padStart(2, "0")}:00`}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preço por hora (R$)" name="price" errors={err.price}>
            <input id="price" name="price" inputMode="decimal" defaultValue={v.price} className="input" aria-invalid={!!err.price} placeholder="120,00" />
          </Field>
        </div>

        <Field label="Link da foto (opcional)" name="imageUrl" errors={err.imageUrl} hint="Cole o link https:// de uma foto da quadra.">
          <input id="imageUrl" name="imageUrl" type="url" defaultValue={v.imageUrl} className="input" aria-invalid={!!err.imageUrl} placeholder="https://…" />
        </Field>

        <div className="flex gap-3 border-t border-slate-100 pt-5">
          <SubmitButton pendingText="Salvando…">{initial.id ? "Salvar alterações" : "Cadastrar quadra"}</SubmitButton>
          <Link href="/painel/quadras" className="btn btn-ghost">
            Cancelar
          </Link>
        </div>
      </div>

      <aside className="hidden lg:block">
        <p className="label">Prévia</p>
        <div className="card overflow-hidden">
          <CourtCover court={{ name: preview.name, sport: preview.sport, imageUrl: preview.imageUrl.startsWith("https://") ? preview.imageUrl : null }} className="h-40 w-full" />
          <div className="p-4">
            <p className="text-xs font-semibold text-brand-700 uppercase">{SPORTS[preview.sport as keyof typeof SPORTS]?.label}</p>
            <p className="font-semibold">{preview.name || "Nome da quadra"}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}
