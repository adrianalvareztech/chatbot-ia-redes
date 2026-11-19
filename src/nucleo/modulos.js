// Carga los módulos que prende src/negocio/config.js. Un módulo nuevo se agrega al CATALOGO.
import conocimientoArchivo from "../modulos/conocimiento-archivo.js";
import conocimientoNotion from "../modulos/conocimiento-notion.js";
import agendaLink from "../modulos/agenda-link.js";
import agendaCal from "../modulos/agenda-cal.js";
import avisoTelegram from "../modulos/aviso-telegram.js";
import avisoCorreo from "../modulos/aviso-correo.js";
import voz from "../modulos/voz.js";
import pedidos from "../modulos/pedidos.js";
import interesados from "../modulos/interesados.js";
import enlaces from "../modulos/enlaces.js";

export const CATALOGO = {
  conocimiento: { archivo: conocimientoArchivo, notion: conocimientoNotion },
  agenda: { ninguna: null, link: agendaLink, cal: agendaCal },
  aviso: { ninguno: null, telegram: avisoTelegram, correo: avisoCorreo },
  voz: { true: voz, false: null },
  pedidos: { true: pedidos, false: null },
  interesados: { true: interesados, false: null },
  enlaces: { true: enlaces, false: null },
};

// Las acciones que el bot siempre tiene, prenda lo que prenda.
export const ACCIONES_DEL_NUCLEO = {
  ninguna: { descripcion: "Solo contestas. Es lo normal." },
  pasar_al_dueno: { descripcion: "No sabes la respuesta, hay una queja o algo necesita a una persona. El sistema escribe la frase y le avisa al dueño." },
  callarse: { descripcion: "Te habla un amigo o conocido del dueño. No mandas nada." },
};

export function cargar(config) {
  const elegidos = {};
  for (const [tipo, opciones] of Object.entries(CATALOGO)) {
    const valor = String(config.modulos?.[tipo]);
    if (!(valor in opciones)) throw new Error(`config.modulos.${tipo} = "${valor}" no existe. Opciones: ${Object.keys(opciones).join(", ")}`);
    elegidos[tipo] = opciones[valor];
  }
  return elegidos;
}

// Los módulos prendidos, en una lista.
export const prendidos = (modulos) => Object.values(modulos).filter(Boolean);

export function accionesDisponibles(config, modulos) {
  const acciones = { ...ACCIONES_DEL_NUCLEO };
  for (const m of prendidos(modulos)) Object.assign(acciones, m.acciones || {});
  for (const [nombre, a] of Object.entries(config.acciones || {})) acciones[nombre] = { descripcion: a.descripcion, link: a.link };
  return acciones;
}

// El módulo que sabe ejecutar una acción, o null si es del núcleo o de config.acciones.
export function duenoDeAccion(modulos, accion) {
  return prendidos(modulos).find((m) => m.acciones?.[accion] && m.ejecutar) || null;
}

// Campos extra que los módulos piden en la respuesta del modelo (por ejemplo, la cita).
export function camposExtra(modulos) {
  return Object.assign({}, ...prendidos(modulos).map((m) => m.campos || {}));
}

export function secretosQueFaltan(env, modulos) {
  const base = ["ANTHROPIC_API_KEY", "ZERNIO_API_KEY", "ZERNIO_WEBHOOK_SECRET"];
  const todos = [...base, ...prendidos(modulos).flatMap((m) => m.secretos || [])];
  return [...new Set(todos)].filter((s) => !env[s]);
}
