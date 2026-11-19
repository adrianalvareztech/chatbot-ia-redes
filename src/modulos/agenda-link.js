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
    return { link: `${link}${separador}metadata[conversacion]=${encodeURIComponent(conv.id)}` };
  },
};
