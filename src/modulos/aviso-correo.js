// Aviso al dueño por correo, con Resend (resend.com).
// [verificar] Sin dominio propio, Resend solo deja mandar al correo de tu cuenta de Resend:
// si esa cuenta es la del dueño, basta.

export default {
  nombre: "aviso-correo",
  secretos: ["RESEND_API_KEY"],
  // Nunca lanza: si Resend falla, el bot sigue contestando y el aviso queda en el log.
  async avisar(env, config, texto) {
    const para = config.aviso.correo;
    if (!env.RESEND_API_KEY || !para) return console.warn("aviso sin correo configurado:", texto);
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: config.aviso.remitente || "Chatbot <onboarding@resend.dev>",
          to: [para],
          subject: `Chatbot de ${config.negocio}: ${texto.split("\n")[0].slice(0, 80)}`,
          text: texto,
        }),
      });
      if (!r.ok) console.error(`Resend respondió ${r.status}: ${await r.text()}`);
    } catch (e) {
      console.error("Resend no respondió:", e.message, "|", texto);
    }
  },
};
