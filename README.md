# ⚽ Arena Fácil

Plataforma de reserva de quadras esportivas. Clientes encontram quadras, veem os horários livres e reservam; donos de quadra recebem os pedidos, confirmam ou recusam e acompanham o faturamento num painel.

## Funcionalidades

**Cliente**
- Busca de quadras por cidade, modalidade, preço máximo e nome/bairro
- Página da quadra com fotos, endereço, descrição e **grade de horários livres** por dia
- Reserva em um clique (com confirmação), até 60 dias à frente
- "Minhas reservas": próximas, histórico e cancelamento

**Dono de quadra**
- Painel simples: pedidos para aprovar ou recusar (com botão de WhatsApp do cliente) e os próximos jogos da semana
- **Mensalistas**: horário fixo toda semana (quadra, dia, hora, nome e WhatsApp), bloqueado automaticamente na agenda
- Lista de todas as reservas com filtros; cancelar reservas confirmadas
- Cadastro e edição de quadras (modalidade, endereço, foto, preço, horário de funcionamento), pausar/ativar

## Tecnologias

- [Next.js 15](https://nextjs.org) (App Router, Server Actions) + React 19 + TypeScript
- [Prisma](https://www.prisma.io) ORM — SQLite em desenvolvimento, PostgreSQL em produção
- Tailwind CSS 4
- zod (validação), bcrypt (senhas), JWT em cookie httpOnly (sessão)

## Como rodar localmente

Pré-requisito: [Node.js 20+](https://nodejs.org).

```bash
npm install
cp .env.example .env        # no Windows: copy .env.example .env
# edite AUTH_SECRET no .env com um valor aleatório (o comando está no próprio arquivo)
npm run setup               # cria o banco e carrega dados de exemplo
npm run dev
```

Acesse http://localhost:3000
### Usuários de teste (senha `123456`)

| Perfil  | Email                    |
|---------|--------------------------|
| Cliente | cliente@arenafacil.com   |
| Dono    | dono@arenafacil.com      |
| Dona    | marina@arenafacil.com    |

### Comandos úteis

| Comando              | O que faz                                              |
|----------------------|--------------------------------------------------------|
| `npm run dev`        | Servidor de desenvolvimento                            |
| `npm run build`      | Build de produção                                      |
| `npm run db:reset`   | Apaga o banco e recarrega os dados de exemplo          |
| `npm run db:studio`  | Abre o Prisma Studio para ver/editar o banco           |
| `npm run typecheck`  | Checa os tipos do TypeScript                           |
| `npm run test:smoke` | Testa os fluxos principais (com o servidor rodando na porta 3000 e dados de exemplo) |

## Estrutura

```
prisma/
  schema.prisma        modelos User, Court, Booking, FixedSlot (mensalista)
  seed.ts              dados de exemplo
src/
  app/
    actions/           Server Actions (auth, reservas, quadras) — regras de negócio
    quadras/           listagem e página da quadra com agenda
    minhas-reservas/   área do cliente
    painel/            área do dono (métricas, reservas, quadras)
    entrar/ cadastro/  autenticação
  components/          componentes de interface
  lib/                 banco, sessão, datas/fuso, formatação, validação
  middleware.ts        protege /painel e /minhas-reservas
```

## Regras de negócio

- Reservas são blocos de 1 hora dentro do horário de funcionamento da quadra.
- Status: **Pendente** → **Confirmada** ou **Recusada** (pelo dono); Pendente/Confirmada → **Cancelada**.
- Um índice único no banco (`slotKey`) impede reserva dupla, mesmo com cliques simultâneos.
- Não é possível reservar horários passados, com mais de 60 dias de antecedência ou a própria quadra.
- O preço é gravado na reserva (mudar o preço da quadra não altera reservas antigas).
- Quadras com histórico não podem ser excluídas, só pausadas.
- Mensalista ocupa o horário em todas as semanas; não dá para cadastrar em cima de reservas avulsas já marcadas (o dono recusa/cancela antes).
- Datas e horários usam o fuso de São Paulo.

## Colocar no ar

1. Crie um banco PostgreSQL (ex.: [Neon](https://neon.tech) ou [Supabase](https://supabase.com), ambos com plano grátis).
2. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
3. Faça deploy na [Vercel](https://vercel.com) importando o repositório e configure as variáveis `DATABASE_URL` e `AUTH_SECRET`.
4. Rode `npx prisma db push` apontando para o banco de produção (e `npm run db:seed` se quiser os dados de exemplo).

## Próximos passos sugeridos

- Pagamento online (Pix / Mercado Pago) com sinal na reserva
- Notificações por WhatsApp/email quando a reserva é confirmada
- Upload de fotos (em vez de link)
- Bloqueio de horários pelo dono e controle de pagamento dos mensalistas
- Avaliações das quadras
