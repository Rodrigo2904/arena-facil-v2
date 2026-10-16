import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "OWNER" ? "/painel" : "/quadras");

  return (
    <AuthShell
      headline="Sua quadra organizada, sem bagunça no WhatsApp."
      text="Reservas, horários e mensalistas em um só lugar."
      bullets={["Pedidos de reserva em um só lugar", "Mensalistas bloqueados toda semana", "Aprove ou recuse com um clique"]}
      title="Entrar"
      subtitle="Acesse sua conta."
      footer={
        <p>
          Ainda não tem conta?{" "}
          <Link
            href={next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"}
            className="font-semibold text-brand-700 hover:underline"
          >
            Cadastre-se grátis
          </Link>
        </p>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
