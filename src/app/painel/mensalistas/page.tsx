import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { WEEKDAYS } from "@/lib/constants";
import { formatSlot, whatsappUrl } from "@/lib/format";
import { deleteFixedSlot } from "@/app/actions/fixed-slots";
import { Flash } from "@/components/Flash";
import { SubmitButton } from "@/components/buttons";
import { EmptyState, PageHeader } from "@/components/ui";
import { FixedSlotForm } from "./FixedSlotForm";

export const metadata: Metadata = { title: "Mensalistas" };

export default async function PanelFixedSlots({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const owner = await requireOwner();
  const sp = await searchParams;

  const [courts, slots] = await Promise.all([
    db.court.findMany({
      where: { ownerId: owner.id },
      select: { id: true, name: true, openHour: true, closeHour: true },
      orderBy: { createdAt: "asc" },
    }),
    db.fixedSlot.findMany({
      where: { court: { ownerId: owner.id } },
      include: { court: { select: { name: true } } },
      orderBy: [{ weekday: "asc" }, { startHour: "asc" }],
    }),
  ]);

  if (courts.length === 0) {
    return (
      <EmptyState
        title="Cadastre uma quadra primeiro"
        text="Depois você pode reservar horários fixos semanais para seus mensalistas."
        action={
          <Link href="/painel/quadras/nova" className="btn btn-primary">
            Cadastrar quadra
          </Link>
        }
      />
    );
  }

  // Segunda primeiro, domingo por último
  const order = [1, 2, 3, 4, 5, 6, 0];
  const byDay = order.map((d) => ({ day: d, list: slots.filter((s) => s.weekday === d) })).filter((g) => g.list.length);

  return (
    <>
      <Flash ok={sp.ok} erro={sp.erro} />
      <PageHeader title="Mensalistas" subtitle="Horários fixos toda semana. Eles ficam bloqueados automaticamente na sua agenda." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section aria-label="Mensalistas cadastrados">
          {byDay.length ? (
            <div className="card divide-y divide-slate-100">
              {byDay.map(({ day, list }) => (
                <div key={day} className="p-4">
                  <p className="mb-2 text-sm font-semibold text-slate-900">{day === 0 || day === 6 ? "Todo" : "Toda"} {WEEKDAYS[day].toLowerCase()}</p>
                  <ul className="space-y-2">
                    {list.map((s) => {
                      const wa = whatsappUrl(s.phone);
                      return (
                        <li key={s.id} className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="font-mono font-semibold">{formatSlot(s.startHour)}</span>
                          <span className="min-w-0 flex-1">
                            <span className="font-medium">{s.clientName}</span> · <span className="text-slate-500">{s.court.name}</span>
                            {wa && (
                              <a href={wa} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-700 hover:underline">
                                💬 {s.phone}
                              </a>
                            )}
                          </span>
                          <form action={deleteFixedSlot}>
                            <input type="hidden" name="id" value={s.id} />
                            <SubmitButton
                              className="btn btn-ghost btn-sm"
                              pendingText="…"
                              confirm={`Remover ${s.clientName}? O horário volta a ficar livre para reservas.`}
                            >
                              Remover
                            </SubmitButton>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="card p-6 text-center text-sm text-slate-500">Nenhum mensalista ainda. Use o formulário para cadastrar o primeiro.</p>
          )}
        </section>

        <FixedSlotForm courts={courts} />
      </div>
    </>
  );
}
