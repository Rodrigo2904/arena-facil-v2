import { db } from "@/lib/db";
import { requireOwner } from "@/lib/auth";
import { nowLocal } from "@/lib/time";
import { PanelNav } from "./PanelNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  const now = nowLocal();

  const pending = await db.booking.count({
    where: {
      status: "PENDING",
      court: { ownerId: owner.id },
      OR: [{ date: { gt: now.date } }, { date: now.date, startHour: { gt: now.hour } }],
    },
  });

  // O painel continua claro mesmo com o tema escuro ligado (vira na próxima etapa)
  return (
    <div className="light min-h-full bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">Painel do dono</p>
          <PanelNav pending={pending} />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
