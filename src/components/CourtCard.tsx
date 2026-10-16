import Link from "next/link";
import { sportInfo } from "@/lib/constants";
import { SportIcon } from "./SportIcon";
import { cityState, formatMoney } from "@/lib/format";

type CourtCardData = {
  id: string;
  name: string;
  sport: string;
  city: string;
  state?: string;
  neighborhood: string;
  imageUrl: string | null;
  priceCents: number;
};

export function CourtCover({ court, className = "" }: { court: Pick<CourtCardData, "name" | "sport" | "imageUrl">; className?: string }) {
  const sport = sportInfo(court.sport);
  if (court.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={court.imageUrl} alt={court.name} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${sport.gradient} dark:brightness-[.85] dark:saturate-[.7] ${className}`} aria-hidden>
      <SportIcon name={sport.icon} className="size-16 text-white drop-shadow" />
    </div>
  );
}

export function CourtCard({ court }: { court: CourtCardData }) {
  const sport = sportInfo(court.sport);
  return (
    <Link
      href={`/quadras/${court.id}`}
      className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <CourtCover court={court} className="h-40 w-full" />
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tracking-wide text-brand-700 uppercase">{sport.label}</span>
          <span className="text-sm font-bold text-slate-900">
            {formatMoney(court.priceCents)}
            <span className="font-normal text-slate-500">/h</span>
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{court.name}</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          📍 {court.neighborhood ? `${court.neighborhood}, ` : ""}
          {cityState(court)}
        </p>
      </div>
    </Link>
  );
}
