// Dados de demonstração. Rodar com: npm run db:seed  (ou npm run db:reset para zerar)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, isPastSlot, nowLocal, weekdayOf } from "../src/lib/time";

const db = new PrismaClient();

async function main() {
  await db.booking.deleteMany();
  await db.fixedSlot.deleteMany();
  await db.court.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  const cliente = await db.user.create({
    data: { name: "Rodrigo Cliente", email: "cliente@arenafacil.com", phone: "(11) 98888-1111", passwordHash, role: "CLIENT" },
  });
  const outros = await Promise.all(
    ["Ana Souza", "Bruno Lima", "Carla Dias", "Diego Rocha"].map((name, i) =>
      db.user.create({
        data: { name, email: `jogador${i + 1}@exemplo.com`, phone: `(11) 97777-000${i}`, passwordHash, role: "CLIENT" },
      }),
    ),
  );
  const dono = await db.user.create({
    data: { name: "João Dono", email: "dono@arenafacil.com", phone: "(11) 99999-2222", passwordHash, role: "OWNER" },
  });
  const dona2 = await db.user.create({
    data: { name: "Marina Arenas", email: "marina@arenafacil.com", phone: "(19) 99999-3333", passwordHash, role: "OWNER" },
  });

  const courtsData = [
    { owner: dono, name: "Arena Central Society", sport: "society", city: "São Paulo", neighborhood: "Mooca", address: "Rua da Mooca, 1200", price: 18000, open: 8, close: 24,
      description: "Grama sintética nova, iluminação LED, vestiário com chuveiro quente e estacionamento gratuito. Bar com churrasqueira para o pós-jogo." },
    { owner: dono, name: "Quadra Vila Belmiro", sport: "futsal", city: "São Paulo", neighborhood: "Tatuapé", address: "Av. Celso Garcia, 4500", price: 12000, open: 7, close: 23,
      description: "Quadra coberta com piso emborrachado oficial. Ideal para jogos em dias de chuva." },
    { owner: dono, name: "Beach Point", sport: "beach_tennis", city: "São Paulo", neighborhood: "Mooca", address: "Rua Taquari, 300", price: 9000, open: 6, close: 22,
      description: "Duas quadras de areia tratada, aluguel de raquetes e bolinhas no local." },
    { owner: dono, name: "Mineirão Society", sport: "society", city: "São Paulo", neighborhood: "Penha", address: "Rua Dr. João Ribeiro, 88", price: 15000, open: 9, close: 23,
      description: "Campo society 7x7 com arquibancada. Aceitamos mensalistas." },
    { owner: dona2, name: "Padel Club Campinas", sport: "padel", city: "Campinas", neighborhood: "Cambuí", address: "Rua Coronel Quirino, 900", price: 14000, open: 7, close: 23,
      description: "Quadras panorâmicas de vidro, padrão internacional. Aulas para iniciantes aos sábados." },
    { owner: dona2, name: "Ginásio Taquaral", sport: "volei", city: "Campinas", neighborhood: "Taquaral", address: "Av. Heitor Penteado, 1500", price: 10000, open: 8, close: 22,
      description: "Ginásio coberto com rede oficial e marcação para vôlei e basquete." },
    { owner: dona2, name: "Arena Barão", sport: "society", city: "Campinas", neighborhood: "Barão Geraldo", address: "Av. Albino J. B. de Oliveira, 2100", price: 16000, open: 8, close: 24,
      description: "Dois campos society, lanchonete e wi-fi. Perto da Unicamp." },
    { owner: dona2, name: "Quadra da Praça", sport: "basquete", city: "Campinas", neighborhood: "Centro", address: "Praça Carlos Gomes, 10", price: 6000, open: 8, close: 20,
      description: "Quadra de basquete com tabelas oficiais. Ótima para racha de fim de tarde." },
  ];

  const courts = [];
  for (const c of courtsData) {
    courts.push(
      await db.court.create({
        data: {
          ownerId: c.owner.id, name: c.name, sport: c.sport, city: c.city, state: "SP", neighborhood: c.neighborhood,
          address: c.address, description: c.description, priceCents: c.price, openHour: c.open, closeHour: c.close,
        },
      }),
    );
  }

  // Mensalistas do João (weekday: 0 = domingo ... 6 = sábado)
  const fixedData = [
    { court: courts[0], weekday: 3, startHour: 20, clientName: "Pelada dos Amigos", phone: "(11) 96666-1010" },
    { court: courts[0], weekday: 2, startHour: 21, clientName: "Time da Firma", phone: "(11) 96666-2020" },
    { court: courts[1], weekday: 4, startHour: 19, clientName: "Futsal Veteranos", phone: null },
    { court: courts[3], weekday: 6, startHour: 10, clientName: "Racha de Sábado", phone: "(11) 96666-3030" },
  ];
  for (const f of fixedData) {
    await db.fixedSlot.create({
      data: { courtId: f.court.id, weekday: f.weekday, startHour: f.startHour, clientName: f.clientName, phone: f.phone },
    });
  }
  const fixedKeys = new Set(fixedData.map((f) => `${f.court.id}:${f.weekday}:${f.startHour}`));

  // Reservas: 20 dias atrás até 10 dias à frente, gerador determinístico
  const now = nowLocal();
  let seed = 42;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  const players = [cliente, ...outros];
  const used = new Set<string>();
  let count = 0;

  for (let offset = -20; offset <= 10; offset++) {
    const date = addDays(now.date, offset);
    for (const court of courts) {
      const perDay = Math.floor(rand() * (court.sport === "society" ? 6 : 3));
      for (let i = 0; i < perDay; i++) {
        const hour = court.openHour + Math.floor(rand() * (court.closeHour - court.openHour));
        const key = `${court.id}:${date}:${hour}`;
        if (used.has(key) || fixedKeys.has(`${court.id}:${weekdayOf(date)}:${hour}`)) continue;
        used.add(key);

        const past = isPastSlot(date, hour, now);
        const r = rand();
        const status = past
          ? r < 0.85 ? "CONFIRMED" : r < 0.93 ? "CANCELLED" : "REJECTED"
          : r < 0.55 ? "CONFIRMED" : r < 0.9 ? "PENDING" : "CANCELLED";
        const user = players[Math.floor(rand() * players.length)];

        await db.booking.create({
          data: {
            courtId: court.id, userId: user.id, date, startHour: hour, status, priceCents: court.priceCents,
            slotKey: status === "PENDING" || status === "CONFIRMED" ? key : null,
          },
        });
        count++;
      }
    }
  }

  console.log(`Seed ok: ${players.length + 2} usuários, ${courts.length} quadras, ${count} reservas, ${fixedData.length} mensalistas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
