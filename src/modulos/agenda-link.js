// Agenda con link: el bot manda el link de Cal.com y la persona elige su horario ahí.
// Cal resuelve la zona horaria, la confirmación y los recordatorios.

export default {
  nombre: "agenda-link",
  secretos: [],
  acciones: {
    mandar_link_cita: { descripcion: "La persona ya quiere agendar. El sistema le manda el link para que elija su horario." },
  },
  async ejecutar(accion, salida, { config, conv }) {
    // El id de la conversación viaja con la cita: así se sabe de qué plática salió.
    const link = config.agenda.link;
    const separador = link.includes("?") ? "&" : "?";
    const r = { link: `${link}${separador}metadata[conversacion]=${encodeURIComponent(conv.id)}` };
    // Con agenda.avisar = true el dueño se entera de a quién se le mandó el link y qué se sabe de esa persona.
    if (config.agenda.avisar) {
      const quien = [conv.nombre, conv.usuario && `@${conv.usuario}`].filter(Boolean).join(" ") || `la conversación ${conv.id}`;
      const datos = Object.entries({ ...conv.datos, ...Object.fromEntries(Object.entries(salida.datos || {}).filter(([, v]) => v !== null && v !== "")) }).map(([k, v]) => `- ${k}: ${v}`);
      r.aviso = [`Le mandé el link para agendar a ${quien} (${conv.canal}).`, ...datos].join("\n");
    }
    return r;
  },
};
