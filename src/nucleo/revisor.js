// El revisor: lo que no puede salir aunque el prompt lo pida o el modelo lo invente.
// El prompt dice qué hacer; este archivo cuida lo prohibido. Un prompt se puede ignorar, el código no.
//
// Rechazo de fondo (no se salva): precio, link, teléfono, correo u horario inventado, acción que
//   no existe, repetir lo que ya dijo, dos preguntas, palabras prohibidas.
// Rechazo de forma (se salva recortando): muchos mensajes o uno demasiado largo.
import { limpio } from "./silencio.js";

const NUM = String.raw`\d{1,3}(?:[ ,.]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
const MONEDA_ANTES = String.raw`(?:us\$|\$|€|\busd\b|\bmxn\b|\beur\b)`;
const MONEDA_DESPUES = String.raw`(?:pesos|mxn|usd|d[oó]lares|dlls|euros|eur|€)(?![a-z])`;
const DINERO = new RegExp(`${MONEDA_ANTES}\\s?(${NUM})|(${NUM})\\s?${MONEDA_DESPUES}`, "gi");
const NUMERO = new RegExp(NUM, "g");
// Con precios = "nunca": también una cifra dicha a medias ("15 mil", "quince mil pesos", "unos 300 dólares").
const DINERO_EN_PALABRAS = /\b\d+\s?mil\b|\bmil(es)? (de )?(pesos|d[oó]lares)\b|\b(pesos|d[oó]lares|mxn|usd)\b/i;
const CORREO = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const ENLACE = /\bhttps?:\/\/[^\s<>()]+|\bwww\.[^\s<>()]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|mx|net|org|io|ai|app|dev|co|me|link|site|store|shop|info|biz|es|us)\b(?:\/[^\s<>()]*)?/gi;
const TELEFONO = /\+?\d[\d\s().-]{7,}\d/g;

// "1,200", "1 200" y "1200.00" son la misma cifra.
export function cifra(texto) {
  let t = String(texto).trim().replace(/[ ,.](?=\d{3}(?!\d))/g, "");
  t = t.replace(",", ".");
  const n = Number.parseFloat(t);
  return Number.isNaN(n) ? null : String(n);
}

const cifrasDe = (texto) => new Set([...String(texto).matchAll(NUMERO)].map((m) => cifra(m[0])).filter(Boolean));
const digitos = (t) => String(t).replace(/\D/g, "");
const sinPuntoFinal = (t) => t.replace(/[.,;:!?]+$/, "");

export function revisar(salida, { acciones, config, conocimiento = "", extras = [], yaDijo = [], horarios = null, revisores = [] }) {
  if (!salida || !Array.isArray(salida.mensajes) || typeof salida.accion !== "string") {
    return rechazo([`no es el objeto pedido: ${JSON.stringify(salida)?.slice(0, 200)}`]);
  }
  if (!acciones[salida.accion]) return rechazo([`la acción "${salida.accion}" no existe`]);

  // Se calla: no sale nada.
  if (salida.accion === "callarse") return { ok: true, motivos: [], soloForma: false, salida: { ...salida, mensajes: [] } };

  // Pasa al dueño: la frase es fija, una que no se haya usado en esta plática.
  if (salida.accion === "pasar_al_dueno") {
    const frases = config.dueno.frases_pase;
    const libres = frases.filter((f) => !yaDijo.includes(f));
    const opciones = libres.length ? libres : frases;
    const frase = opciones[Math.floor(Math.random() * opciones.length)];
    return { ok: true, motivos: [], soloForma: false, salida: { ...salida, mensajes: [frase] } };
  }

  // Limpieza: sin ¿ ni ¡ al inicio y sin guion largo.
  const mensajes = salida.mensajes
    .map((m) => String(m || "").replace(/^[¿¡]+/, "").replace(/\s*\u2014\s*/g, ", ").trim())
    .filter(Boolean);

  const fuente = [conocimiento, ...extras.filter(Boolean)].join("\n");
  const fuenteMinus = fuente.toLowerCase();
  const permitidos = [fuenteMinus, ...(config.revisor.enlaces || []).map((e) => e.toLowerCase())].join("\n");
  const cifrasFuente = cifrasDe(fuente);
  const telefonosFuente = [...fuente.matchAll(TELEFONO)].map((m) => digitos(m[0]));
  const dichoAntes = yaDijo.map(limpio);

  const fondo = [];
  for (const m of mensajes) {
    // Precios.
    for (const d of m.matchAll(DINERO)) {
      if (config.revisor.precios === "nunca") continue; // se revisa abajo, una vez por mensaje
      else if (!cifrasFuente.has(cifra(d[1] || d[2]))) fondo.push(`da un precio que no está en "Lo que sabes" (${d[0].trim()})`);
    }
    if (config.revisor.precios === "nunca" && (DINERO.test(m) || DINERO_EN_PALABRAS.test(m))) fondo.push(`da un precio y este bot nunca da precios: "${m}"`);
    DINERO.lastIndex = 0;
    // Correos.
    const correos = m.match(CORREO) || [];
    for (const c of correos) if (!fuenteMinus.includes(c.toLowerCase())) fondo.push(`da un correo que no está en "Lo que sabes" (${c})`);
    // Links y dominios (sin contar los correos).
    const sinCorreos = m.replace(CORREO, " ");
    for (const e of sinCorreos.match(ENLACE) || []) {
      if (!permitidos.includes(sinPuntoFinal(e).toLowerCase())) fondo.push(`escribe un link que no está en "Lo que sabes" (${e})`);
    }
    // Teléfonos.
    for (const t of sinCorreos.match(TELEFONO) || []) {
      const d = digitos(t);
      if (d.length < 8) continue;
      if (!telefonosFuente.some((f) => f.endsWith(d) || d.endsWith(f))) fondo.push(`da un teléfono que no está en "Lo que sabes" (${t.trim()})`);
    }
    // Repetir palabra por palabra algo largo que ya dijo en esta plática.
    if (m.length > 40 && dichoAntes.includes(limpio(m))) fondo.push(`repite un mensaje que ya mandó: "${m}"`);
    // Palabras prohibidas.
    for (const p of config.revisor.palabras_prohibidas || []) {
      if (limpio(m).includes(limpio(p))) fondo.push(`usa una palabra prohibida: "${p}"`);
    }
  }

  // Horario inventado: solo con la agenda dentro del chat.
  if (salida.accion === "agendar" && horarios) {
    const inicio = salida.cita?.inicio;
    if (!inicio || !horarios.includes(inicio)) fondo.push(`ofrece un horario que no está en la lista de horarios libres (${inicio || "vacío"})`);
  }

  // Lo que revisa cada módulo prendido (por ejemplo, que un pedido solo traiga cosas del menú).
  for (const r of revisores) fondo.push(...(r(salida) || []));

  const preguntas = (mensajes.join(" ").match(/\?/g) || []).length;
  if (config.mensajes.una_pregunta && preguntas > 1) fondo.push(`hace ${preguntas} preguntas; deja solo una`);

  const forma = [];
  const { maximo, caracteres } = config.mensajes;
  if (mensajes.length < 1 || mensajes.length > maximo) forma.push(`deben ser de 1 a ${maximo} mensajes (mandó ${mensajes.length})`);
  for (const m of mensajes) {
    if (m.length > caracteres) forma.push(`un mensaje tiene ${m.length} caracteres y el máximo es ${caracteres}`);
  }

  const motivos = [...fondo, ...forma];
  return { ok: motivos.length === 0, motivos, soloForma: fondo.length === 0 && forma.length > 0, salida: { ...salida, mensajes } };
}

// Salva una respuesta que solo falló de forma: se queda con el primer y el último mensaje,
// y corta los largos en el último punto o signo que quepa.
export function recortar(salida, config) {
  const { maximo, caracteres } = config.mensajes;
  let mensajes = salida.mensajes;
  if (mensajes.length > maximo) mensajes = maximo === 1 ? [mensajes.at(-1)] : [mensajes[0], mensajes.at(-1)];
  mensajes = mensajes.map((m) => (m.length <= caracteres ? m : cortar(m, caracteres))).filter(Boolean);
  return mensajes.length ? { ...salida, mensajes } : null;
}

function cortar(texto, tope) {
  const parte = texto.slice(0, tope);
  const fin = Math.max(parte.lastIndexOf(". "), parte.lastIndexOf("? "), parte.lastIndexOf("! "));
  if (fin > tope * 0.4) return parte.slice(0, fin + 1).trim();
  const espacio = parte.lastIndexOf(" ");
  return (espacio > 0 ? parte.slice(0, espacio) : parte).trim();
}

function rechazo(motivos) {
  return { ok: false, motivos, soloForma: false, salida: null };
}
