// Aviso al dueño por un bot de Telegram. El chat es fijo (config.aviso.telegram_chat):
// así nadie más puede recibir los avisos escribiéndole al bot.
const API = "https://api.telegram.org/bot";

export default {
  nombre: "aviso-telegram",
  secretos: ["TELEGRAM_BOT_TOKEN"],
  // Nunca lanza: si Telegram falla, el bot sigue contestando y el aviso queda en el log.
  async avisar(env, config, texto) {
    const chat = config.aviso.telegram_chat;
    if (!env.TELEGRAM_BOT_TOKEN || !chat) return console.warn("aviso sin Telegram configurado:", texto);
    try {
      const r = await fetch(`${API}${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: texto.slice(0, 4000), disable_web_page_preview: true }),
      });
      if (!r.ok) console.error(`Telegram respondió ${r.status}: ${await r.text()}`);
    } catch (e) {
      console.error("Telegram no respondió:", e.message, "|", texto);
    }
  },
};
