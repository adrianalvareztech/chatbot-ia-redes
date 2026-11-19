// Crea o lista el webhook de Zernio que le avisa al bot de cada mensaje.
//   npm run webhook -- listar
//   npm run webhook -- crear https://chatbot.TU-SUBDOMINIO.workers.dev
// Lee ZERNIO_API_KEY y ZERNIO_WEBHOOK_SECRET de .dev.vars. Nunca imprime las llaves.
import { readFileSync, existsSync } from "node:fs";

const BASE = "https://zernio.com/api/v1";
const vars = existsSync(".dev.vars")
  ? Object.fromEntries(readFileSync(".dev.vars", "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]))
  : {};
const llave = process.env.ZERNIO_API_KEY || vars.ZERNIO_API_KEY;
const secreto = process.env.ZERNIO_WEBHOOK_SECRET || vars.ZERNIO_WEBHOOK_SECRET;
if (!llave) {
  console.error("Falta ZERNIO_API_KEY en .dev.vars.");
  process.exit(1);
}

const pedir = async (metodo, ruta, cuerpo) => {
  const r = await fetch(BASE + ruta, {
    method: metodo,
    headers: { authorization: `Bearer ${llave}`, "content-type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Zernio respondió ${r.status}: ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : {};
};
// Quita cualquier campo "secret" antes de imprimir.
const sinSecretos = (x) => JSON.parse(JSON.stringify(x, (k, v) => (/secret/i.test(k) ? "(oculto)" : v)));

const [accion, url] = process.argv.slice(2);
if (accion === "listar") {
  console.log(JSON.stringify(sinSecretos(await pedir("GET", "/webhooks/settings")), null, 2));
} else if (accion === "crear" && url) {
  if (!secreto) {
    console.error("Falta ZERNIO_WEBHOOK_SECRET en .dev.vars (invéntalo tú: una frase larga al azar).");
    process.exit(1);
  }
  const destino = url.replace(/\/+$/, "") + "/webhooks/zernio";
  const r = await pedir("POST", "/webhooks/settings", {
    name: "chatbot", url: destino, events: ["message.received", "message.sent"], secret: secreto,
  });
  console.log(`Webhook creado hacia ${destino}`);
  console.log(JSON.stringify(sinSecretos(r), null, 2));
} else {
  console.log("Uso:\n  npm run webhook -- listar\n  npm run webhook -- crear https://chatbot.TU-SUBDOMINIO.workers.dev");
}
