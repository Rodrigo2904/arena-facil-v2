# ⚽ Arena Fácil

Meu projeto pessoal de SaaS para **donos de quadra**: o dono divulga a quadra, os jogadores dele reservam pelo site e ele só aprova ou recusa. Nada de agenda perdida no WhatsApp.

A ideia é começar pequeno, focado no dono, que é quem paga. Os jogadores chegam pelo link que o dono divulga. A busca de quadras "perto de mim" e o marketplace ficam para depois, quando já houver alguns donos usando.

## O que já funciona

**Dono da quadra**
- **Pedidos**: lista de reservas para aprovar ou recusar, com botão que abre o WhatsApp do cliente, e os próximos jogos da semana
- **Mensalistas**: horário fixo toda semana (quadra, dia, hora, nome e WhatsApp), bloqueado sozinho na agenda
- **Reservas**: histórico completo com filtros; cancelar reservas confirmadas
- **Quadras**: cadastro com endereço completo (CEP, cidade e estado), foto, preço e horário de funcionamento; pausar e ativar

**Jogador**
- Página da quadra com os horários livres de cada dia e reserva em um clique (até 60 dias à frente)
- **Como chegar**: botão que abre o Google Maps, mapa da quadra e atalho para o Waze
- "Minhas reservas": próximas, histórico e cancelamento

**Telas de acesso**: um login só para todo mundo e dois cadastros, um para o dono e outro para o jogador, cada um com o texto voltado para quem vai usar.

## Rodar na minha máquina

Precisa do [Node.js 20+](https://nodejs.org) e do [Git](https://git-scm.com).

```bash
git clone https://github.com/Rodrigo2904/arena-facil-v2.git
cd arena-facil-v2
npm install
cp .env.example .env        # no Windows: copy .env.example .env
```

Abra o `.env` e troque o `AUTH_SECRET` por um texto aleatório. O comando para gerar um está no próprio arquivo. Depois:

```bash
npm run setup               # cria o banco com os dados de exemplo
npm run dev                 # http://localhost:3000
```

### Usuários de teste

Todos com a senha `123456`.

| Perfil  | Email                    |
|---------|--------------------------|
| Jogador | cliente@arenafacil.com   |
| Dono    | dono@arenafacil.com      |
| Dona    | marina@arenafacil.com    |

O dono "João" já vem com quadras, pedidos pendentes e mensalistas de exemplo.

### Trabalhar em mais de uma máquina

```bash
git pull                    # antes de começar: traz o que mudou
git add -A
git commit -m "o que eu fiz"
git push                    # quando terminar: envia para o GitHub
```

O `.env` e o banco (`prisma/dev.db`) não vão para o GitHub. Cada máquina tem os seus.

## Comandos

| Comando              | O que faz |
|----------------------|-----------|
| `npm run dev`        | Liga o servidor em http://localhost:3000 |
| `npm run db:reset`   | Apaga o banco e recarrega os dados de exemplo |
| `npm run db:studio`  | Abre o Prisma Studio para ver e editar o banco |
| `npm run typecheck`  | Confere os tipos do TypeScript |
| `npm run test:smoke` | Testa os fluxos principais (com o `npm run dev` rodando) |

O `test:smoke` cria usuários e quadras de teste ("Minha Quadra", em Recife). Depois de rodar, use `npm run db:reset` para limpar.

## Como o código está organizado

Feito com Next.js 15 (App Router e Server Actions), React 19, TypeScript, Prisma com SQLite e Tailwind CSS 4.

```
prisma/
  schema.prisma          tabelas: User, Court (quadra), Booking (reserva), FixedSlot (mensalista)
  seed.ts                dados de exemplo
src/
  app/
    page.tsx             página inicial
    quadras/             lista de quadras e página da quadra (horários + mapa)
    minhas-reservas/     área do jogador
    painel/              área do dono: pedidos, mensalistas, reservas, quadras
    entrar/ cadastro/    login e cadastros (dono e jogador)
    actions/             regras de negócio (login, reservas, quadras, mensalistas)
    fonts/               fonte Inter (fica no projeto, não baixa do Google)
  components/            peças de tela reaproveitadas (botões, cards, moldura do login…)
  lib/                   banco, sessão, datas e fuso, formatação, validação
  middleware.ts          protege /painel e /minhas-reservas
scripts/smoke-test.mjs   teste automático dos fluxos
```

## Regras do sistema

- Cada reserva é um bloco de 1 hora dentro do horário de funcionamento da quadra.
- Status: **Pendente** → **Confirmada** ou **Recusada** (pelo dono); Pendente ou Confirmada → **Cancelada**.
- Não existe reserva dupla: o banco bloqueia mesmo com dois cliques ao mesmo tempo.
- Não dá para reservar horário que já passou, com mais de 60 dias de antecedência ou na própria quadra.
- O preço fica gravado na reserva. Mudar o preço da quadra não muda reservas antigas.
- Quadra com histórico não pode ser excluída, só pausada.
- Mensalista ocupa o horário toda semana. Não dá para cadastrar um em cima de reservas avulsas já marcadas: antes o dono recusa ou cancela essas reservas.
- O estado (UF) é obrigatório na quadra e o CEP é opcional; os dois ajudam o mapa a achar o lugar certo.
- Datas e horários seguem o fuso de São Paulo.

## Ideias para depois

Mais perto, para o dono:
- Marcar se o mensalista pagou o mês
- O dono lançar uma reserva que chegou pelo WhatsApp
- Bloquear horários (manutenção, evento)
- Avisar o jogador por WhatsApp ou email quando a reserva for confirmada
- Upload de foto da quadra (hoje é por link)

Mais para frente:
- Pagamento online (Pix) com sinal na reserva
- Busca de quadras perto de mim, com mapa (quando houver umas 15 a 20 quadras na mesma cidade)
- Avaliações das quadras

## Se algo der errado

- **Página sem estilo, erro estranho do Next ou servidor que não sobe:** pare o servidor, apague a pasta `.next` e rode `npm run dev` de novo. A `.next` é só cache e se recria sozinha.
- **Não deixe o projeto dentro do OneDrive** (ou de outra pasta sincronizada). A sincronização estraga a pasta `.next`.
