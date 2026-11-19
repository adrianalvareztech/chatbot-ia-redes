// Enlaces: el bot manda un link que ya está escrito en "Lo que sabes" (un producto, una propiedad,
// un recurso, la página de inscripción). Sirve cuando hay muchos links y cambian seguido: se editan
// en conocimiento.md o en Notion y no se toca el código.
//
// El bot elige el link y lo copia en "enlace". Este archivo revisa que sea idéntico a uno de
// "Lo que sabes" (o de config.revisor.enlaces) y lo manda. Un link que no existe ahí no sale.
// Para uno o dos links fijos no hace falta este módulo: usa `acciones` en config.js.

const URL = /https?:\/\/[^\s<>()|\]]+/gi;
const sinPuntoFinal = (t) => String(t || "").trim().replace(/[.,;:!?]+$/, "");

export function enlacesDe(conocimiento, config) {
  const deLoQueSabe = (String(conocimiento || "").match(URL) || []).map(sinPuntoFinal);
  return new Set([...deLoQueSabe, ...(config?.revisor?.enlaces || []).map(sinPuntoFinal)]);
}

export default {
  nombre: "enlaces",
  secretos: [],
  acciones: {
    mandar_link: { descripcion: 'Vas a mandar un link que aparece en "Lo que sabes". Cópialo tal cual en "enlace". Lo manda el sistema: tú no lo escribes en tus mensajes.' },
  },
  campos: { enlace: { anyOf: [{ type: "string" }, { type: "null" }] } },

  revisar(salida, { config, conocimiento }) {
    if (salida.accion !== "mandar_link") return [];
    const enlace = sinPuntoFinal(salida.enlace);
    if (!enlace) return ['falta copiar el link en "enlace"'];
    if (!enlacesDe(conocimiento, config).has(enlace)) return [`el link ${enlace} no está en "Lo que sabes". Copia uno tal cual o usa pasar_al_dueno`];
    return [];
  },

  async ejecutar(accion, salida, { config, conocimiento }) {
    const enlace = sinPuntoFinal(salida.enlace);
    if (!enlacesDe(conocimiento, config).has(enlace)) return { fallo: `el link ${enlace || "(vacío)"} no está en "Lo que sabes"` };
    return { link: enlace };
  },
};
