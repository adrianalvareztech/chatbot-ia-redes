// Cuándo se calla el bot y cuándo regresa. Una sola regla y un solo campo: `callado_hasta`.
//
// 1. El dueño escribe a mano: el bot se calla `horas_silencio` horas. Cada mensaje suyo renueva.
// 2. El bot pasa la plática al dueño: mismo silencio.
// 3. Al vencer el plazo, si la persona vuelve a escribir, el bot retoma.
// 4. Si el dueño escribe la frase de regreso ("te dejo con mi asistente"), regresa al instante.
// 5. horas_silencio = 0 significa para siempre.

const PARA_SIEMPRE = "9999-12-31T23:59:59.999Z";
const VENTANA_MS = 23.5 * 3600 * 1000; // Meta deja contestar 24 h; se deja media hora de margen.

// Quita acentos, mayúsculas y espacios de más para comparar textos.
export const limpio = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/\s+/g, " ").trim();

// Quién mandó un mensaje que salió de la cuenta:
//   sentVia "human"            → el dueño (contestó desde el inbox de Zernio)
//   sentVia null o ausente     → eco del bot si el texto coincide con un envío reciente; si no, el dueño
//   sentVia "api"              → el bot si coincide; si no, otra automatización
//   cualquier otro valor       → otra automatización (secuencias, workflows...)
export function quienMando(saliente, enviosRecientes = []) {
  const texto = limpio(saliente.texto);
  const coincide = texto !== "" && enviosRecientes.some((e) => limpio(e) === texto);
  const via = saliente.sentVia;
  if (via === "human") return "dueno";
  if (via === null || via === undefined) return coincide ? "bot" : "dueno";
  if (via === "api") return coincide ? "bot" : "otra";
  return "otra";
}

export function esRegreso(texto, frase) {
  return Boolean(frase) && limpio(texto).includes(limpio(frase));
}

// El motivo por el que está callado, o null si el bot puede contestar.
export function estaCallado(conv, ahora) {
  if (!conv?.callado_hasta) return null;
  return conv.callado_hasta > ahora.toISOString() ? (conv.callado_motivo || "callado") : null;
}

// Estuvo callado y ya venció: el bot retoma, con una nota para no repetir lo del dueño.
export function vencioSilencio(conv, ahora) {
  return Boolean(conv?.callado_hasta) && !estaCallado(conv, ahora);
}

export function hastaCuando(ahora, horas) {
  if (!horas) return PARA_SIEMPRE;
  return new Date(ahora.getTime() + horas * 3600 * 1000).toISOString();
}

export function dentroDeVentana(conv, ahora) {
  if (!conv?.ultimo_entrante) return false;
  return ahora.getTime() - Date.parse(conv.ultimo_entrante) < VENTANA_MS;
}
