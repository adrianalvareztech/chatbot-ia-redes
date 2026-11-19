// Te dice el id de tu chat de Telegram, que va en aviso.telegram_chat de src/negocio/config.js.
//   1. Crea tu bot con @BotFather y pon su token en .dev.vars (TELEGRAM_BOT_TOKEN).
//   2. Abre tu bot en Telegram y mándale cualquier mensaje ("hola").
//   3. Corre: npm run telegram-chat
// Nunca imprime el token.
import { existsSync, readFileSync } from "node:fs";

const vars = existsSync(".dev.vars")
  ? Object.fromEntries(readFileSync(".dev.vars", "utf8").split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]))
  : {};
const token = process.env.TELEGRAM_BOT_TOKEN || vars.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("Falta TELEGRAM_BOT_TOKEN en .dev.vars.");
  process.exit(1);
}

const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
if (!r.ok) {
  console.error(`Telegram respondió ${r.status}. Revisa que el token esté bien copiado.`);
  process.exit(1);
}
const { result = [] } = await r.json();
const chats = new Map();
for (const u of result) {
  const c = (u.message || u.channel_post || u.my_chat_member)?.chat;
  if (c) chats.set(c.id, c.title || [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || "(sin nombre)");
}
if (!chats.size) {
  console.log("Todavía no hay mensajes. Abre tu bot en Telegram, mándale \"hola\" y vuelve a correr esto.");
  process.exit(1);
}
console.log("Chats que le han escrito a tu bot:\n");
for (const [id, nombre] of chats) console.log(`  ${id}   ${nombre}`);
console.log("\nCopia el número del tuyo en aviso.telegram_chat de src/negocio/config.js (entre comillas).");
console.log("Si quieres que el aviso le llegue a varias personas, crea un grupo, mete al bot y usa el número del grupo.");
