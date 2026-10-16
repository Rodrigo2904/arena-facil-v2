import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; tipo?: string }>;
}) {
  const { next, tipo } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "OWNER" ? "/painel" : "/quadras");

  const owner = tipo === "dono";
  const loginHref = next ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar";
  const footer = (
    <>
      <p>
        Já tem conta?{" "}
        <Link href={loginHref} className="font-semibold text-brand-700 hover:underline">
          Entrar
        </Link>
      </p>
      <p className="text-slate-500">
        {owner ? (
          <>
            Só quer jogar?{" "}
            <Link href={next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"} className="font-medium text-slate-700 underline hover:text-slate-900">
              Crie uma conta de jogador
            </Link>
          </>
        ) : (
          <>
            É dono de quadra?{" "}
            <Link href="/cadastro?tipo=dono" className="font-medium text-slate-700 underline hover:text-slate-900">
              Cadastre sua quadra aqui
            </Link>
          </>
        )}
      </p>
    </>
  );

  return owner ? (
    <AuthShell
      headline="Organize sua quadra em poucos minutos."
      text="Grátis para começar. Seus clientes reservam pelo seu link e você só aprova."
      bullets={[
        "Pedidos de reserva em um só lugar, nada perdido no WhatsApp",
        "Mensalistas com horário bloqueado toda semana",
        "Aprove ou recuse com um clique",
      ]}
      title="Cadastre sua quadra"
      subtitle="Crie sua conta de dono. Depois é só cadastrar a quadra."
      footer={footer}
    >
      <SignupForm next={next} role="OWNER" />
    </AuthShell>
  ) : (
    <AuthShell
      headline="Reserve sua quadra em segundos."
      text="Veja os horários livres e reserve na hora, sem esperar resposta no WhatsApp."
      bullets={["Horários livres sempre atualizados", "Acompanhe suas reservas em um só lugar"]}
      title="Criar conta"
      subtitle="É grátis e leva menos de um minuto."
      footer={footer}
    >
      <SignupForm next={next} role="CLIENT" />
    </AuthShell>
  );
}
