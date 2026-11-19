// Mandar un mensaje por Zernio. Es lo único que el núcleo le pide a Zernio.
const BASE = "https://zernio.com/api/v1";

export class ErrorZernio extends Error {
  constructor(status, cuerpo) {
    super(`Zernio respondió ${status}: ${String(cuerpo).slice(0, 300)}`);
    this.status = status;
    this.cuerpo = cuerpo;
  }

  // Se llegó al tope gratis de 10,000 mensajes del mes.
  get sinMensajes() {
    return this.status === 403 && /message_allowance_exceeded/.test(this.cuerpo);
  }
}

export function cliente(env) {
  return {
    // `idem` evita que un reintento mande el mismo mensaje dos veces.
    async dm(cuenta, conversacion, texto, idem) {
      const headers = { authorization: `Bearer ${env.ZERNIO_API_KEY}`, "content-type": "application/json" };
      if (idem) headers["idempotency-key"] = idem;
      const r = await fetch(`${BASE}/inbox/conversations/${encodeURIComponent(conversacion)}/messages`, {
        method: "POST", headers, body: JSON.stringify({ accountId: cuenta, message: texto }),
      });
      const cuerpo = await r.text();
      if (!r.ok) throw new ErrorZernio(r.status, cuerpo);
      return cuerpo ? JSON.parse(cuerpo) : {};
    },
  };
}
