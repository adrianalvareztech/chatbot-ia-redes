// Traduce un evento de Zernio a una forma propia, corta y siempre igual.
// Así el resto del núcleo no depende de cómo nombra Zernio cada campo.
//
//   entrante: alguien le escribió al negocio
//   saliente: salió un mensaje de la cuenta (del bot, del dueño o de otra automatización)
//   ignorar:  todo lo demás, con el motivo

export function normalizar(evento) {
  const tipo = evento?.event || evento?.type;
  const m = evento?.message;
  if (tipo !== "message.received" && tipo !== "message.sent") return ignorar(`evento que no interesa: ${tipo}`);
  if (!m || !m.conversationId) return ignorar("evento sin mensaje");

  const cuenta = evento.account?.accountId || m.accountId || null;
  const fecha = m.sentAt || m.createdAt || new Date().toISOString();

  if (tipo === "message.sent") {
    return {
      tipo: "saliente",
      conversacion: String(m.conversationId),
      cuenta,
      texto: m.text || "",
      // null = lo mandó una persona desde la app; "api" = lo mandó este bot (o otro programa).
      sentVia: m.sentVia ?? null,
      externo: m.id || m.platformMessageId || null,
      fecha,
    };
  }

  const meta = evento.metadata || m.metadata || {};
  if (meta.standby) return ignorar("otra app tiene esta conversación");
  if (m.direction && m.direction !== "incoming") return ignorar("mensaje de la propia cuenta");
  if (m.sender?.isOwnAccount) return ignorar("mensaje de la propia cuenta");

  const adjunto = (m.attachments || [])[0];
  return {
    tipo: "entrante",
    conversacion: String(m.conversationId),
    cuenta,
    // [verificar] el nombre del campo de la red en Messenger y WhatsApp.
    canal: evento.account?.platform || evento.conversation?.platform || m.platform || "instagram",
    persona: String(m.sender?.id ?? m.conversationId),
    nombre: m.sender?.name || null,
    usuario: m.sender?.username || null,
    texto: m.text || "",
    adjunto: adjunto ? { tipo: adjunto.type || "archivo", url: adjunto.url || adjunto.payload?.url || null } : null,
    fecha,
  };
}

// Zernio puede tener varias cuentas conectadas. El bot solo atiende las de config.js.
export function esDeMiCuenta(evento, cuentas) {
  return Boolean(evento?.cuenta) && (cuentas || []).includes(evento.cuenta);
}

// Un mensaje que solo trae una foto o un audio se guarda con una marca que el turno entiende.
const MARCA = /^\[adjunto:([^\]]+)\]\s*(.*)$/;

export function marcaAdjunto(adjunto) {
  return `[adjunto:${adjunto.tipo}] ${adjunto.url || ""}`.trim();
}

export function leerAdjunto(texto) {
  const r = MARCA.exec(texto || "");
  return r ? { tipo: r[1], url: r[2] || null } : null;
}

function ignorar(motivo) {
  return { tipo: "ignorar", motivo };
}
