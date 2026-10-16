import Link from "next/link";
import type { ReactNode } from "react";
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const info = BOOKING_STATUS[status as BookingStatus] ?? BOOKING_STATUS.CANCELLED;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${info.className}`}>
      {info.short}
    </span>
  );
}

export function Field({
  label,
  name,
  errors,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      {children}
      {errors?.length ? (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-rose-600">
          {errors[0]}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Alert({ tone, children }: { tone: "success" | "error" | "info"; children: ReactNode }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    error: "bg-rose-50 text-rose-800 ring-rose-200",
    info: "bg-sky-50 text-sky-800 ring-sky-200",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ring-1 ring-inset ${styles}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-3 text-4xl" aria-hidden>
        🏟️
      </div>
      <p className="font-semibold text-slate-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-600">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-white py-2 pr-4 pl-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition ring-inset hover:text-brand-700 hover:ring-brand-500 dark:bg-white/5 dark:shadow-none"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 transition group-hover:-translate-x-0.5" aria-hidden>
        <path
          fillRule="evenodd"
          d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </Link>
  );
}
