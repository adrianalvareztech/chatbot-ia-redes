// Interesados: cuando el bot ya juntó los datos de una persona (qué busca, su nombre, su teléfono...),
// se los manda al dueño en un solo aviso, sin callarse. Sirve para la inmobiliaria que califica, el
// negocio que cotiza a mano, la escuela que inscribe o la agencia que quiere saber quién le escribió.
//
// Qué datos son obligatorios se dice en config.interesados.campos. Todos tienen que estar en config.datos.
// El bot no puede usar la acción si falta uno: el revisor la rechaza y le dice cuál preguntar.

const lleno = (v) => v !== null && v !== undefined && String(v).trim() !== "";

// Lo que ya se sabía de la persona más lo que dijo en este mensaje.
function juntar(conv, salida) {
  const nuevos = Object.fromEntries(Object.entries(salida.datos || {}).filter(([, v]) => lleno(v)));
  return { ...(conv?.datos || {}), ...nuevos };
}

// Una línea con los datos obligatorios, para saber si esa ficha ya se mandó.
const ficha = (campos, datos) => campos.map((c) => `${c}=${String(datos[c]).trim()}`).join("; ");

export default {
  nombre: "interesados",
  secretos: [],
  acciones: {
    registrar_interesado: { descripcion: "Ya tienes todos los datos obligatorios de la persona. El sistema se los manda al dueño para que le dé seguimiento. Tú le dices que ya quedó anotado y sigues la plática." },
  },

  revisar(salida, { config, conv }) {
    if (salida.accion !== "registrar_interesado") return [];
    const campos = config.interesados?.campos || [];
    const datos = juntar(conv, salida);
    const faltan = campos.filter((c) => !lleno(datos[c]));
    if (faltan.length) return [`para registrar_interesado falta: ${faltan.join(", ")}. Pregunta lo que falta (una cosa por mensaje) con la acción ninguna`];
    if (conv?.datos?.ficha_enviada === ficha(campos, datos)) return ["los datos de esta persona ya se le mandaron al dueño: contesta con la acción ninguna"];
    return [];
  },

  async ejecutar(accion, salida, { config, conv }) {
    const campos = config.interesados?.campos || [];
    const datos = juntar(conv, salida);
    const faltan = campos.filter((c) => !lleno(datos[c]));
    if (faltan.length) return { fallo: `faltan datos: ${faltan.join(", ")}` };
    const quien = [conv.nombre, conv.usuario && `@${conv.usuario}`].filter(Boolean).join(" ") || `la conversación ${conv.id}`;
    const lineas = Object.entries(datos).filter(([k, v]) => lleno(v) && k !== "ficha_enviada").map(([k, v]) => `- ${k}: ${v}`);
    return {
      aviso: [`Interesado nuevo: ${quien} (${conv.canal})`, ...lineas, "El bot sigue atendiendo. Si le escribes tú, se calla."].join("\n"),
      datos: { ficha_enviada: ficha(campos, datos) },
    };
  },
};
