import Link from "next/link";
import { db } from "@/lib/db";
import { SPORTS, type Sport } from "@/lib/constants";
import { CourtCard } from "@/components/CourtCard";
import { HeroBackground } from "@/components/HeroBackground";
import { SportIcon } from "@/components/SportIcon";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [courts, cities, withPhoto] = await Promise.all([
    db.court.findMany({ where: { active: true }, orderBy: { createdAt: "desc" }, take: 6 }),
    db.court.findMany({ where: { active: true }, select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
    // Quadras com foto cadastrada pelo dono entram no fundo do topo
    db.court.findMany({
      where: { active: true, imageUrl: { startsWith: "https://" } },
      select: { name: true, city: true, imageUrl: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);
  const heroCourts = withPhoto.map((c) => ({ src: c.imageUrl!, label: `${c.name} · ${c.city}` }));

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <HeroBackground courts={heroCourts} />
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl items-center px-4 py-16 sm:py-20">
          <div className="min-w-0 max-w-2xl">
            <p className="mb-3 text-sm font-semibold tracking-wide text-brand-200 uppercase">Reserva de quadras sem complicação</p>
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
              Encontre a quadra, veja o horário livre e marque o jogo.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">
              Society, futsal, vôlei, beach tennis e muito mais. Sem ligação, sem grupo de WhatsApp.
            </p>
  
            <form action="/quadras" className="mt-8 grid gap-3 rounded-2xl bg-white p-3 shadow-xl sm:grid-cols-[1fr_1fr_auto] dark:bg-brand-950/80 dark:ring-1 dark:ring-white/10 dark:backdrop-blur">
              <label className="sr-only" htmlFor="cidade">
                Cidade
              </label>
              <select id="cidade" name="cidade" className="input" defaultValue="">
                <option value="">Todas as cidades</option>
                {cities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="esporte">
                Modalidade
              </label>
              <select id="esporte" name="esporte" className="input" defaultValue="">
                <option value="">Todos os esportes</option>
                {Object.entries(SPORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary px-6">Buscar quadras</button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-4 text-lg font-bold">Escolha a modalidade</h2>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SPORTS) as Sport[]).map((key) => (
            <Link
              key={key}
              href={`/quadras?esporte=${key}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-slate-200 hover:ring-brand-500 dark:bg-white/5 dark:shadow-none dark:ring-white/10"
            >
              <SportIcon name={SPORTS[key].icon} className="size-5 text-brand-700" />
              {SPORTS[key].label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-lg font-bold">Quadras em destaque</h2>
          <Link href="/quadras" className="text-sm font-semibold text-brand-700 hover:underline">
            Ver todas →
          </Link>
        </div>
        {courts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((c) => (
              <CourtCard key={c.id} court={c} />
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Nenhuma quadra cadastrada ainda.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["🔎", "Encontre", "Filtre por cidade, modalidade e preço."],
            ["🕒", "Escolha o horário", "Veja na hora quais horários estão livres."],
            ["✅", "Confirme", "O dono confirma e você recebe o status na sua conta."],
          ].map(([icon, title, text]) => (
            <div key={title} className="card p-5">
              <div className="text-2xl">{icon}</div>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-900 p-8 text-white sm:flex-row sm:items-center dark:bg-gradient-to-r dark:from-brand-900 dark:to-brand-950 dark:ring-1 dark:ring-white/10">
          <div>
            <h2 className="text-xl font-bold">Tem uma quadra?</h2>
            <p className="mt-1 text-slate-300 dark:text-brand-100">
              Grátis para começar: receba pedidos de reserva, aprove com um clique e organize seus mensalistas.
            </p>
          </div>
          <Link href="/cadastro?tipo=dono" className="btn bg-white text-slate-900 hover:bg-slate-100 dark:text-brand-900 dark:hover:bg-brand-100">
            Anunciar minha quadra
          </Link>
        </div>
      </section>
    </>
  );
}
