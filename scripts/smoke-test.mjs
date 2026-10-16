// Teste ponta a ponta sem navegador: lê os <form> do HTML (Next renderiza
// server actions como formulários que funcionam sem JS) e envia como um navegador.
const BASE = "http://localhost:3000";
let pass = 0, fail = 0;
const ok = (cond, msg) => { cond ? pass++ : fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${msg}`); };

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

class Browser {
  cookies = new Map();
  cookieHeader() { return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "); }
  store(res) {
    for (const c of res.headers.getSetCookie()) {
      const [kv] = c.split(";"); const i = kv.indexOf("=");
      const k = kv.slice(0, i), v = kv.slice(i + 1);
      if (!v || /Max-Age=0|Expires=Thu, 01 Jan 1970/i.test(c)) this.cookies.delete(k); else this.cookies.set(k, v);
    }
  }
  async get(path) {
    const res = await fetch(BASE + path, { headers: { cookie: this.cookieHeader() }, redirect: "manual" });
    this.store(res);
    return { status: res.status, location: res.headers.get("location"), html: await res.text() };
  }
  forms(html) {
    return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/g)].map(([, attrs, body]) => {
      const fields = {};
      for (const [tag] of body.matchAll(/<input\b[^>]*>/g)) {
        const name = tag.match(/name="([^"]*)"/)?.[1];
        const value = tag.match(/value="([^"]*)"/)?.[1] ?? "";
        const type = tag.match(/type="([^"]*)"/)?.[1];
        if (name && (type === "hidden" || !type || type === "text")) fields[decode(name)] = decode(value);
      }
      return { attrs, body, fields };
    });
  }
  async submit(pagePath, form, extra = {}) {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ ...form.fields, ...extra })) fd.append(k, v);
    const res = await fetch(BASE + pagePath, {
      method: "POST", body: fd, redirect: "manual",
      headers: { cookie: this.cookieHeader(), origin: BASE },
    });
    this.store(res);
    return { status: res.status, location: res.headers.get("location") ?? res.headers.get("x-action-redirect"), html: await res.text() };
  }
  async login(email, password) {
    const page = await this.get("/entrar");
    const form = this.forms(page.html).find((f) => f.body.includes('name="password"'));
    return this.submit("/entrar", form, { email, password });
  }
}

const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

// 1. Páginas públicas
const anon = new Browser();
let r = await anon.get("/");
ok(r.status === 200 && r.html.includes("Quadras em destaque"), "home carrega");
r = await anon.get("/quadras?esporte=padel");
ok(r.status === 200 && r.html.includes("Padel Club Campinas") && !r.html.includes("Arena Central Society"), "filtro por modalidade");
r = await anon.get("/quadras?busca=mooca");
ok(r.html.includes("Arena Central Society") && r.html.includes("Beach Point"), "busca por bairro");
r = await anon.get("/painel");
ok(r.status === 307 && r.location.includes("/entrar"), "painel exige login");
r = await anon.get("/quadras/nao-existe");
ok(r.status === 404, "quadra inexistente -> 404");

// 2. Login
const cli = new Browser();
r = await cli.login("cliente@arenafacil.com", "errada");
ok(r.html.includes("Email ou senha inválidos"), "senha errada recusada");
r = await cli.login("cliente@arenafacil.com", "123456");
ok(cli.cookies.has("arena_session"), "login do cliente cria sessão");
r = await cli.get("/painel");
ok(r.status === 307 && !r.location.includes("entrar"), "cliente não entra no painel");

// 3. Reserva
const list = await cli.get("/quadras?busca=Vila%20Belmiro");
const courtPath = list.html.match(/href="(\/quadras\/[a-z0-9]+)"/)[1];
let page = await cli.get(`${courtPath}?data=${tomorrow}`);
const before = new Set(cli.forms((await cli.get("/minhas-reservas")).html).map((f) => f.fields.bookingId));
const slotForm = cli.forms(page.html).find((f) => "hour" in f.fields);
ok(!!slotForm, "grade mostra horário livre");
r = await cli.submit(`${courtPath}?data=${tomorrow}`, slotForm);
ok(r.location?.includes("/minhas-reservas?ok=reservada"), `reserva criada (${r.status} ${r.location})`);
r = await cli.submit(`${courtPath}?data=${tomorrow}`, slotForm);
ok(r.location?.includes("erro=ocupado"), "reserva duplicada bloqueada");
r = await cli.submit(courtPath, slotForm, { date: "2020-01-01" });
ok(r.location?.includes("erro=horario-passado"), "data passada bloqueada");
r = await cli.submit(courtPath, slotForm, { hour: "3" });
ok(r.location?.includes("erro=horario-invalido"), "hora fora do funcionamento bloqueada");
page = await cli.get(`${courtPath}?data=${tomorrow}`);
ok(page.html.includes("Sua reserva"), "horário aparece como 'Sua reserva'");
let mine = await cli.get("/minhas-reservas");
ok(mine.html.includes("Quadra Vila Belmiro") && mine.html.includes("Pendente"), "minhas reservas mostra pendente");

// 4. Dono confirma
const own = new Browser();
await own.login("dono@arenafacil.com", "123456");
r = await own.get("/painel");
ok(r.status === 200 && r.html.includes("Pedidos para responder"), "painel de pedidos carrega");
const pend = await own.get(`/painel/reservas?status=PENDING`);
const newId = cli.forms(mine.html).find((f) => f.fields.bookingId && !before.has(f.fields.bookingId))?.fields.bookingId;
const ownerForm = own.forms(pend.html).find((f) => f.fields.bookingId === newId);
ok(!!ownerForm, "dono vê o pedido novo");
r = await own.submit("/painel/reservas?status=PENDING", ownerForm, { action: "confirm" });
ok(r.location?.includes("ok=confirm"), "dono confirma reserva");
mine = await cli.get("/minhas-reservas");
ok(mine.html.includes("Confirmada"), "cliente vê reserva confirmada");

// 5. Segurança: outro dono não mexe na reserva
const other = new Browser();
await other.login("marina@arenafacil.com", "123456");
r = await other.submit("/painel/reservas", ownerForm, { action: "cancel" });
ok(r.location?.includes("erro=acao-invalida"), "outro dono não consegue cancelar reserva alheia");

// 6. Cliente cancela
mine = await cli.get("/minhas-reservas");
const cancelForm = cli.forms(mine.html).find((f) => f.fields.bookingId === newId);
r = await cli.submit("/minhas-reservas", cancelForm);
ok(r.location?.includes("ok=cancelada"), "cliente cancela reserva");
page = await cli.get(`${courtPath}?data=${tomorrow}`);
ok(cli.forms(page.html).some((f) => f.fields.hour === slotForm.fields.hour), "horário volta a ficar livre");

// 7. Cadastro + XSS
const neo = new Browser();
page = await neo.get("/cadastro");
const signupForm = neo.forms(page.html).find((f) => f.body.includes('name="password"'));
const email = `teste${Date.now()}@ex.com`;
r = await neo.submit("/cadastro", signupForm, { name: "<script>alert(1)</script>", email, password: "123", role: "CLIENT" });
ok(r.html.includes("pelo menos 6"), "senha curta recusada");
r = await neo.submit("/cadastro", signupForm, { name: "<img src=x onerror=alert(1)>", email, password: "123456", role: "OWNER" });
ok(neo.cookies.has("arena_session") && r.location?.includes("/painel"), "cadastro de dono entra no painel");
r = await neo.get("/painel");
ok(!r.html.includes("<img src=x") && r.html.includes("&lt;img"), "nome com HTML é escapado (sem XSS)");
const anon2 = new Browser();
r = await anon2.submit("/cadastro", signupForm, { name: "Hacker", email: `h${Date.now()}@ex.com`, password: "123456", role: "ADMIN" });
ok(!r.location && !anon2.cookies.has("arena_session"), "papel inválido (ADMIN) recusado");
r = await anon2.submit("/cadastro", signupForm, { name: "Dup", email: "cliente@arenafacil.com", password: "123456", role: "CLIENT" });
ok(r.html.includes("já está cadastrado") && !anon2.cookies.has("arena_session"), "email duplicado recusado");

// 8. Novo dono cadastra quadra com preço negativo e depois válido
page = await neo.get("/painel/quadras/nova");
const courtForm = neo.forms(page.html).find((f) => f.body.includes('name="price"'));
const base = { name: "Minha Quadra", sport: "society", description: "", address: "Rua A, 1", neighborhood: "", city: "Recife", imageUrl: "", openHour: "8", closeHour: "22" };
r = await neo.submit("/painel/quadras/nova", courtForm, { ...base, price: "-50" });
ok(r.html.includes("Preço inválido") || r.html.includes("maior que zero"), "preço negativo recusado");
r = await neo.submit("/painel/quadras/nova", courtForm, { ...base, price: "150,50", closeHour: "7" });
ok(r.html.includes("depois da abertura"), "fechamento antes da abertura recusado");
r = await neo.submit("/painel/quadras/nova", courtForm, { ...base, price: "150,50" });
ok(r.location?.includes("ok=criada"), "quadra criada");
r = await anon.get("/quadras?cidade=Recife");
ok(r.html.includes("Minha Quadra") && r.html.includes("150,50"), "quadra nova aparece na busca com preço certo");

// 9. Mensalistas (na quadra nova do teste, sem reservas antigas)
page = await neo.get("/painel/mensalistas");
const fixedForm = neo.forms(page.html).find((f) => f.body.includes('name="clientName"'));
const neoCourt = `/quadras/${fixedForm.fields.courtId}`;
const weekday = String(new Date(`${tomorrow}T12:00:00Z`).getUTCDay());
const nextWeek = new Date(Date.parse(`${tomorrow}T12:00:00Z`) + 7 * 86400000).toISOString().slice(0, 10);
page = await cli.get(`${neoCourt}?data=${tomorrow}`);
const at = (h) => cli.forms(page.html).find((f) => f.fields.hour === h);
r = await cli.submit(`${neoCourt}?data=${tomorrow}`, at("20"));
ok(r.location?.includes("ok=reservada"), "cliente reserva avulso às 20h na quadra nova");
r = await neo.submit("/painel/mensalistas", fixedForm, { clientName: "Pelada Teste", phone: "", weekday, startHour: "20" });
ok(r.html.includes("Já existe 1 reserva"), "mensalista em cima de reserva existente é recusado");
r = await neo.submit("/painel/mensalistas", fixedForm, { clientName: "Pelada Teste", phone: "(81) 98888-0000", weekday, startHour: "21" });
ok(r.location?.includes("ok=mensalista-criado"), "mensalista cadastrado");
r = await neo.submit("/painel/mensalistas", fixedForm, { clientName: "Outro", phone: "", weekday, startHour: "21" });
ok(r.html.includes("Já tem mensalista"), "mensalista duplicado recusado");
page = await cli.get(`${neoCourt}?data=${tomorrow}`);
ok(!at("21") && !!at("19"), "horário do mensalista some da grade do cliente");
page = await cli.get(`${neoCourt}?data=${nextWeek}`);
ok(!at("21"), "bloqueado também na semana seguinte");
r = await cli.submit(neoCourt, { fields: { ...slotForm.fields, courtId: fixedForm.fields.courtId } }, { date: tomorrow, hour: "21" });
ok(r.location?.includes("erro=ocupado"), "reserva forçada no horário do mensalista é bloqueada");
r = await neo.get("/painel");
ok(r.html.includes("Pelada Teste") && r.html.includes("mensalista"), "mensalista aparece nos próximos jogos");
page = await neo.get("/painel/mensalistas");
const delForm = neo.forms(page.html).find((f) => f.fields.id && !f.fields.clientName);
r = await other.submit("/painel/mensalistas", delForm);
ok(!r.location?.includes("ok=mensalista-removido"), "outro dono não remove mensalista alheio");
r = await neo.submit("/painel/mensalistas", delForm);
ok(r.location?.includes("ok=mensalista-removido"), "dono remove mensalista");
page = await cli.get(`${neoCourt}?data=${tomorrow}`);
ok(!!at("21"), "horário volta a ficar livre após remover");

console.log(`\n${pass} passaram, ${fail} falharam`);
process.exit(fail ? 1 : 0);
