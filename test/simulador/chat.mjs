// El chat de prueba en la terminal. Habla con el bot que corre en tu compu (npm run dev) igual que
// lo haría Zernio: manda eventos firmados a /webhooks/zernio. No toca Zernio ni manda nada a nadie.
//
// Antes: en .dev.vars pon MODO=simulador, tu ANTHROPIC_API_KEY y un ZERNIO_WEBHOOK_SECRET cualquiera.
// Luego, en una terminal: npm run db:local && npm run dev    y en otra: npm run simular
//
// Comandos dentro del chat:
//   /dueno <texto>    contestas tú a mano (el bot se calla)
//   /regreso          mandas la frase de regreso (el bot retoma)
//   /rafaga a | b | c tres mensajes seguidos, como cuando alguien escribe en pedacitos
//   /foto             la persona manda solo una foto (el bot no contesta y le avisa al dueño)
//   /repetir          el último evento otra vez (Zernio a veces repite)
//   /firma-mala       un evento con firma falsa (tiene que salir 401)
//   /nueva            empieza otra conversación
//   /estado           enseña lo que el bot recuerda de esta plática
//   /salir
// Con --guion archivo.txt corre una plática escrita: una línea por mensaje (o comando).
import { createHmac, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import config from "../../src/negocio/config.js";

const URL_BOT = (process.env.SIMULADOR_URL || "http://localhost:8787").replace(/\/+$/, "");
const vars = existsSync(".dev.vars")
  ? Object.fromEntries(readFileSync(".dev.vars", "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]))
  : {};
const SECRETO = process.env.ZERNIO_WEBHOOK_SECRET || vars.ZERNIO_WEBHOOK_SECRET;
const CUENTA = config.zernio.cuentas[0];
const ESPERA_MAX = (config.espera_maxima_segundos + 90) * 1000;

if (!SECRETO) {
  console.error("Falta ZERNIO_WEBHOOK_SECRET en .dev.vars (en el simulador puede ser cualquier frase).");
  process.exit(1);
}

let conversacion = nueva();
let ultimoEvento = null;
let visto = 0;

function nueva() {
  return `sim-${Date.now()}`;
}

function evento(tipo, texto, extra = {}) {
  const id = randomUUID();
  const message = tipo === "message.received"
    ? { id: `m-${id}`, conversationId: conversacion, direction: "incoming", text: texto, sentAt: new Date().toISOString(),
        sender: { id: `persona-${conversacion}`, username: "persona_prueba", name: "Persona de prueba" } }
    : { id: `m-${id}`, conversationId: conversacion, direction: "outgoing", text: texto, sentVia: null, sentAt: new Date().toISOString() };
  return { id, cuerpo: JSON.stringify({ id, event: tipo, account: { accountId: CUENTA, platform: "instagram" }, message, ...extra }) };
}

async function mandar({ id, cuerpo }, { firmaMala = false } = {}) {
  ultimoEvento = { id, cuerpo };
  const firma = firmaMala ? "0".repeat(64) : createHmac("sha256", SECRETO).update(cuerpo).digest("hex");
  try {
    const r = await fetch(`${URL_BOT}/webhooks/zernio`, {
      method: "POST", body: cuerpo,
      headers: { "content-type": "application/json", "x-zernio-signature": firma, "x-zernio-event-id": id },
    });
    return `${r.status} ${await r.text()}`;
  } catch {
    console.error(`No encuentro el bot en ${URL_BOT}. ¿Corriste npm run dev en otra terminal?`);
    process.exit(1);
  }
}

async function hilo() {
  const r = await fetch(`${URL_BOT}/simulador/hilo?conversacion=${encodeURIComponent(conversacion)}`);
  if (r.status === 404) {
    console.error("El bot no está en modo simulador. Pon MODO=simulador en .dev.vars y reinicia npm run dev.");
    process.exit(1);
  }
  return r.json();
}

// Espera a que el bot conteste (o a que quede callado) y enseña lo nuevo.
async function esperarRespuesta() {
  const inicio = Date.now();
  process.stdout.write("  (escribiendo...)");
  while (Date.now() - inicio < ESPERA_MAX) {
    await new Promise((r) => setTimeout(r, 1000));
    const { mensajes, conversacion: conv } = await hilo();
    const nuevos = mensajes.filter((m) => m.id > visto && m.quien === "bot");
    if (nuevos.length) {
      process.stdout.write("\r" + " ".repeat(20) + "\r");
      for (const m of nuevos) console.log(`  Bot: ${m.texto}`);
      visto = Math.max(...mensajes.map((m) => m.id));
      if (conv?.callado_hasta) console.log(`  [el bot quedó callado: ${conv.callado_motivo}]`);
      return;
    }
  }
  process.stdout.write("\r");
  console.log("  [el bot no contestó. Revisa la terminal de npm run dev para ver por qué]");
}

async function marcarVisto() {
  const { mensajes } = await hilo();
  visto = Math.max(visto, ...mensajes.map((m) => m.id));
}

// Una línea del chat o del guion.
async function procesar(linea) {
  const texto = linea.trim();
  if (!texto || texto.startsWith("#")) return true;
  if (texto === "/salir") return false;
  if (texto === "/nueva") { conversacion = nueva(); visto = 0; console.log(`  [conversación nueva: ${conversacion}]`); return true; }
  if (texto === "/estado") { console.log(JSON.stringify((await hilo()).conversacion, null, 2)); return true; }
  if (texto === "/repetir") {
    if (!ultimoEvento) { console.log("  [todavía no hay evento que repetir]"); return true; }
    console.log(`  [mismo evento otra vez → ${await mandar(ultimoEvento)}]`);
    return true;
  }
  if (texto === "/firma-mala") { console.log(`  [firma falsa → ${await mandar(evento("message.received", "hola"), { firmaMala: true })}]`); return true; }
  if (texto === "/foto") {
    const e = evento("message.received", "");
    const cuerpo = JSON.parse(e.cuerpo);
    cuerpo.message.attachments = [{ type: "image", url: "https://ejemplo.invalid/foto.jpg" }];
    console.log(`  [la persona mandó una foto → ${await mandar({ id: e.id, cuerpo: JSON.stringify(cuerpo) })}]`);
    console.log("  [el bot no entiende fotos: no contesta y le avisa al dueño. Revisa tu Telegram o la terminal de npm run dev]");
    await new Promise((r) => setTimeout(r, (config.espera_segundos + 3) * 1000));
    return true;
  }
  if (texto.startsWith("/dueno ")) {
    console.log(`  [tú, a mano → ${await mandar(evento("message.sent", texto.slice(7)))}]`);
    await marcarVisto();
    return true;
  }
  if (texto === "/regreso") {
    console.log(`  [frase de regreso → ${await mandar(evento("message.sent", config.dueno.frase_regreso))}]`);
    await esperarRespuesta();
    return true;
  }
  if (texto.startsWith("/rafaga ")) {
    for (const parte of texto.slice(8).split("|").map((p) => p.trim()).filter(Boolean)) {
      await mandar(evento("message.received", parte));
      await new Promise((r) => setTimeout(r, 1500));
    }
    await esperarRespuesta();
    return true;
  }
  if (texto.startsWith("/")) { console.log("  [comando desconocido]"); return true; }
  await mandar(evento("message.received", texto));
  await esperarRespuesta();
  return true;
}

console.log(`Simulador de ${config.negocio}. Conversación ${conversacion}. Escribe /salir para terminar.\n`);
const i = process.argv.indexOf("--guion");
if (i > -1) {
  for (const linea of readFileSync(process.argv[i + 1], "utf8").split(/\r?\n/)) {
    if (linea.trim() && !linea.trim().startsWith("#")) console.log(`Tú: ${linea}`);
    if (!(await procesar(linea))) break;
  }
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  while (await procesar(await rl.question("Tú: ")));
  rl.close();
}
