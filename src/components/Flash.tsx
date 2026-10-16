import { Alert } from "./ui";

// Mensagens exibidas após redirecionamentos das ações (?ok=... / ?erro=...)
const MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  "ok:reservada": { tone: "success", text: "Reserva enviada! Agora é só aguardar a confirmação do dono da quadra." },
  "ok:cancelada": { tone: "success", text: "Reserva cancelada." },
  "ok:confirm": { tone: "success", text: "Reserva confirmada. O cliente já pode ver o status atualizado." },
  "ok:reject": { tone: "success", text: "Reserva recusada. O horário voltou a ficar livre." },
  "ok:cancel": { tone: "success", text: "Reserva cancelada. O horário voltou a ficar livre." },
  "ok:criada": { tone: "success", text: "Quadra cadastrada! Ela já aparece para os clientes." },
  "ok:atualizada": { tone: "success", text: "Quadra atualizada." },
  "ok:pausada": { tone: "success", text: "Quadra pausada. Ela não aparece mais para novas reservas." },
  "ok:ativada": { tone: "success", text: "Quadra ativada novamente." },
  "ok:excluida": { tone: "success", text: "Quadra excluída." },
  "ok:mensalista-criado": { tone: "success", text: "Mensalista cadastrado. O horário fica bloqueado toda semana." },
  "ok:mensalista-removido": { tone: "success", text: "Mensalista removido. O horário voltou a ficar livre." },
  "erro:ocupado": { tone: "error", text: "Esse horário acabou de ser reservado por outra pessoa. Escolha outro." },
  "erro:horario-passado": { tone: "error", text: "Esse horário já passou." },
  "erro:horario-invalido": { tone: "error", text: "Horário inválido para essa quadra." },
  "erro:muito-longe": { tone: "error", text: "Só é possível reservar com até 60 dias de antecedência." },
  "erro:propria-quadra": { tone: "error", text: "Você não pode reservar a sua própria quadra." },
  "erro:quadra-indisponivel": { tone: "error", text: "Essa quadra não está disponível no momento." },
  "erro:nao-cancelavel": { tone: "error", text: "Essa reserva não pode mais ser cancelada." },
  "erro:acao-invalida": { tone: "error", text: "Essa ação não é mais possível para essa reserva." },
  "erro:nao-encontrada": { tone: "error", text: "Quadra não encontrada." },
  "erro:tem-reservas": {
    tone: "error",
    text: "Essa quadra tem histórico de reservas e não pode ser excluída. Use “Pausar” para tirá-la do ar.",
  },
};

export function Flash({ ok, erro }: { ok?: string | string[]; erro?: string | string[] }) {
  const key = typeof erro === "string" ? `erro:${erro}` : typeof ok === "string" ? `ok:${ok}` : null;
  const msg = key ? MESSAGES[key] : null;
  if (!msg) return null;
  return (
    <div className="mb-6">
      <Alert tone={msg.tone}>{msg.text}</Alert>
    </div>
  );
}
