// Agendar dentro del chat, con la API de Cal.com. La persona no sale de la conversación.
// Antes de cada respuesta se le pasan al bot los horarios libres; el revisor rechaza cualquier
// horario que no esté en esa lista. Para agendar pide nombre y correo.
const CAL = "https://api.cal.com/v2";
const MAXIMO_HORARIOS = 12;

const cita = {
  anyOf: [
    { type: "null" },
    {
      type: "object",
      properties: { inicio: { type: "string" }, nombre: { type: "string" }, correo: { type: "string" } },
      required: ["inicio", "nombre", "correo"],
      additionalProperties: false,
    },
  ],
};

export default {
  nombre: "agenda-cal",
  secretos: ["CAL_API_KEY"],
  acciones: {
    agendar: { descripcion: 'Ya eligió uno de los HORARIOS LIBRES y te dio su nombre y correo. Llena "cita" con el horario copiado tal cual.' },
  },
  campos: { cita },

  // Los horarios libres de los próximos días, en la zona horaria del negocio.
  async contexto(env, config) {
    const hoy = new Date();
    const fin = new Date(hoy.getTime() + (config.agenda.dias || 7) * 86400000);
    const q = new URLSearchParams({
      eventTypeId: String(config.agenda.tipo_de_cita),
      start: hoy.toISOString().slice(0, 10),
      end: fin.toISOString().slice(0, 10),
      timeZone: config.zona_horaria,
    });
    const r = await fetch(`${CAL}/slots?${q}`, {
      headers: { authorization: `Bearer ${env.CAL_API_KEY}`, "cal-api-version": "2024-09-04" },
    });
    if (!r.ok) throw new Error(`Cal respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const { data = {} } = await r.json();
    const horarios = Object.values(data).flat().map((s) => s.start).filter(Boolean).slice(0, MAXIMO_HORARIOS);
    const legible = new Intl.DateTimeFormat("es-MX", { timeZone: config.zona_horaria, weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
    const lista = horarios.map((h) => `- ${h} (${legible.format(new Date(h))})`).join("\n");
    return {
      texto: horarios.length ? `HORARIOS LIBRES (ofrece dos o tres; para agendar copia el valor tal cual):\n${lista}` : "HORARIOS LIBRES: no hay en los próximos días.",
      horarios,
    };
  },

  // Fuera de "encendido" no agenda de verdad: solo dice qué haría.
  async ejecutar(accion, salida, { env, config, conv, modo }) {
    const { inicio, nombre, correo } = salida.cita || {};
    if (!inicio || !nombre || !correo) return { fallo: "faltan horario, nombre o correo" };
    if (modo !== "encendido") return { mensajes: [] };
    const r = await fetch(`${CAL}/bookings`, {
      method: "POST",
      headers: { authorization: `Bearer ${env.CAL_API_KEY}`, "cal-api-version": "2024-08-13", "content-type": "application/json" },
      body: JSON.stringify({
        start: new Date(inicio).toISOString(),
        eventTypeId: Number(config.agenda.tipo_de_cita),
        attendee: { name: nombre, email: correo, timeZone: config.zona_horaria, language: "es" },
        metadata: { conversacion: conv.id },
      }),
    });
    if (!r.ok) return { fallo: `Cal respondió ${r.status}: ${(await r.text()).slice(0, 200)}` };
    return { mensajes: [] };
  },
};
