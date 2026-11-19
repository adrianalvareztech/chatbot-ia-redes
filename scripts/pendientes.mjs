// Dice qué falta para poder subir el bot: datos que nadie ha dado todavía y llaves sin poner.
// No inventa nada y no enseña ninguna llave (solo dice si está o no). Uso: npm run pendientes
// `npm run deploy` lo corre antes de subir: si falta un dato, no sube.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import config from "../src/negocio/config.js";
import { cargar, secretosQueFaltan } from "../src/nucleo/modulos.js";

const faltan = [];   // datos: frenan la subida
const llaves = [];   // llaves: solo se avisan (en la nube van como secrets)
const ojo = [];      // cosas que conviene revisar, sin frenar
const m = config.modulos;

// 1. Todo lo que quedó marcado PENDIENTE al configurar, y lo que sigue igual que en la plantilla.
const archivos = [...readdirSync("src/negocio").map((a) => `src/negocio/${a}`), "wrangler.toml"];
for (const ruta of archivos) {
  readFileSync(ruta, "utf8").split(/\r?\n/).forEach((linea, i) => {
    const donde = `${ruta}, línea ${i + 1}: ${linea.trim().slice(0, 110)}`;
    // El link de ejemplo de Cal.com solo cuenta si la agenda con link está prendida.
    if (/TU-USUARIO/.test(linea) && m.agenda !== "link") return;
    // Una nota <!-- PENDIENTE --> en "Lo que sabe" es un dato que el bot todavía no tiene: funciona sin él.
    if (/PENDIENTE/.test(linea) && ruta.endsWith(".md")) return ojo.push(`${donde}\n      (el bot funciona sin este dato: si se lo preguntan, pasa la plática)`);
    if (/PENDIENTE|PEGA_AQUI|ID_DE_LA_CUENTA|TU-USUARIO|Clínica Sonrisa/.test(linea)) faltan.push(donde);
  });
}
// Lo que quedó pendiente en el PRD y el plan, para que no se olvide.
for (const ruta of ["PRD.md", "plan.md"]) {
  if (!existsSync(ruta)) continue;
  const n = (readFileSync(ruta, "utf8").match(/PENDIENTE/g) || []).length;
  if (n) ojo.push(`${ruta} tiene ${n} pendiente(s) anotado(s): revísalos antes de prender`);
}

// 2. Lo que cada pieza prendida necesita para funcionar.
if (m.conocimiento === "notion" && !config.notion.fuentes.length) faltan.push("notion.fuentes: falta el id de la página o base de Notion");
if (m.agenda === "cal" && !config.agenda.tipo_de_cita) faltan.push("agenda.tipo_de_cita: falta el id del tipo de cita de Cal.com");
if (m.aviso === "telegram" && !config.aviso.telegram_chat) faltan.push("aviso.telegram_chat: falta el id de tu chat de Telegram");
if (m.aviso === "correo" && !config.aviso.correo) faltan.push("aviso.correo: falta el correo donde llegan los avisos");
if ((m.pedidos || m.interesados) && m.aviso === "ninguno") faltan.push("pedidos e interesados necesitan un aviso prendido (telegram o correo): sin eso nadie recibe el pedido ni los datos");
else if (m.aviso === "ninguno") ojo.push('modulos.aviso = "ninguno": nadie se entera cuando el bot pasa una plática');

// 3. Llaves en .dev.vars (solo el nombre).
const vars = existsSync(".dev.vars")
  ? Object.fromEntries(readFileSync(".dev.vars", "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((x) => [x[1], x[2]]))
  : {};
for (const s of secretosQueFaltan(vars, cargar(config))) llaves.push(s);

console.log(`Pendientes de ${config.negocio}\n`);
console.log(faltan.length ? `Datos que faltan (${faltan.length}):\n${faltan.map((f) => `  - ${f}`).join("\n")}` : "Datos: no falta ninguno.");
console.log(llaves.length
  ? `\nLlaves que no están en .dev.vars (${llaves.length}): ${llaves.join(", ")}\n  En tu compu van en .dev.vars. En la nube: npx wrangler secret put NOMBRE`
  : "\nLlaves: están todas en .dev.vars.");
if (ojo.length) console.log(`\nOjo:\n${ojo.map((o) => `  - ${o}`).join("\n")}`);
if (faltan.length) {
  console.log("\nMientras falte un dato, el bot no se sube. Pídeselo a quien lo tenga: no se inventa.");
  process.exit(1);
}
