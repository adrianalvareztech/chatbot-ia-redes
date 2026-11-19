// Una plática de mentiras con TU negocio: tu config.js, tu prompt.js y tu conocimiento.md de verdad.
// No usa llaves ni internet. La única pieza falsa es el modelo: tú le dictas lo que "contesta" y
// la prueba revisa qué hace el sistema con eso (qué deja salir el revisor, qué link manda, a quién avisa).
// Sirve para saber que las piezas están bien conectadas antes de gastar un centavo en la API.
//
//   const p = await platica();
//   const r = await p.turno("Hola, cuánto cuesta?", p.dice(["Cuesta $800"]));
//   r.estado    "contestó" | "pasó al dueño" | "se calló" | "callado" ...
//   r.mensajes  lo que le llegaría a la persona en ese turno
//   r.avisos    lo que le llegaría al dueño en ese turno
//   r.rechazo   por qué el revisor rechazó la primera respuesta (o null)
//
// Si tu bot toma pedidos con horario, o tiene cosas que solo hay ciertos días, fija el reloj para
// que la prueba dé lo mismo a cualquier hora:  platica({ ahora: new Date("2026-11-20T18:00:00Z") })
// (esa fecha es viernes a mediodía en México; cámbiala por un momento en que tu negocio esté abierto).
import negocio from "../../src/negocio/config.js";
import reglas from "../../src/negocio/prompt.js";
import archivo from "../../src/modulos/conocimiento-archivo.js";
import { accionesDisponibles, camposExtra, cargar } from "../../src/nucleo/modulos.js";
import { atenderTurno, registrarSaliente } from "../../src/nucleo/turno.js";
import { avisoFalso, memoriaPrueba, modeloFalso } from "./falsos.js";

// Horarios de mentiras para cuando la agenda es "cal" (dentro del chat).
export const HORARIOS = ["2030-01-07T10:00:00.000-06:00", "2030-01-07T12:00:00.000-06:00"];

export async function platica({ config = negocio, ahora, canal = "instagram" } = {}) {
  const id = "platica-1";
  const mem = memoriaPrueba();
  const aviso = avisoFalso();
  const respuestas = [];
  const modelo = modeloFalso(respuestas);
  const modulos = cargar(config);
  // Lo que sabe siempre se lee del archivo: es el borrador que también se pega en Notion.
  modulos.conocimiento = archivo;
  modulos.aviso = null;
  modulos.voz = null;
  if (config.modulos.agenda === "cal") {
    modulos.agenda = { ...modulos.agenda, contexto: async () => ({ texto: `HORARIOS LIBRES:\n${HORARIOS.map((h) => `- ${h}`).join("\n")}`, horarios: HORARIOS }) };
  }
  const acciones = accionesDisponibles(config, modulos);
  const campos = Object.keys(camposExtra(modulos));
  const conocimiento = await archivo.leer();
  let vistos = 0;
  let llamadas = 0;

  const nuevos = async () => {
    const hilo = (await mem.hilo(id, 500, true)).filter((h) => h.quien === "bot");
    const r = hilo.slice(vistos).map((h) => h.texto);
    vistos = hilo.length;
    return r;
  };

  return {
    config, acciones, conocimiento, mem,

    // Lo que "contesta" el modelo. Los datos y campos que no pongas van en null.
    dice(mensajes, accion = "ninguna", extra = {}) {
      const { datos = {}, ...resto } = extra;
      return {
        mensajes: [].concat(mensajes), accion, motivo: "plática de prueba",
        datos: { ...Object.fromEntries((config.datos || []).map((d) => [d, null])), ...datos },
        ...Object.fromEntries(campos.map((c) => [c, null])), ...resto,
      };
    },

    // La persona manda solo una foto (un comprobante, la foto de un trabajo). El bot no la entiende:
    // no contesta y le avisa al dueño. Devuelve lo mismo que turno().
    adjunto(tipo = "imagen") {
      return this.turno({ adjunto: { tipo, url: "https://ejemplo.invalid/foto.jpg" } });
    },

    // La persona escribe y el modelo contesta lo que le dictaste (una respuesta, o dos si la primera se rechaza).
    async turno(texto, ...salidas) {
      respuestas.length = 0;
      respuestas.push(...salidas);
      const adjunto = typeof texto === "object" ? texto.adjunto : null;
      await mem.recibir({ tipo: "entrante", conversacion: id, cuenta: config.zernio.cuentas[0], canal, persona: "p-1", nombre: "Persona de prueba", usuario: "prueba", texto: adjunto ? "" : texto, adjunto, fecha: (ahora || new Date()).toISOString() });
      const antes = aviso.avisos.length;
      const estado = await atenderTurno({
        id, env: { MODO: "simulador" }, config, mem, modulos, reglas, pedirAlModelo: modelo.pedir,
        enviar: async () => { throw new Error("en una plática de prueba no se manda nada"); },
        avisar: aviso.avisar, pausa: async () => {}, ...(ahora ? { ahora: () => ahora } : {}),
      });
      const deEsteTurno = modelo.llamadas.slice(llamadas);
      llamadas = modelo.llamadas.length;
      const rechazo = deEsteTurno.map((l) => /se rechazó por: (.*)\. Corrígela\.$/s.exec(l.usuario)?.[1]).find(Boolean) || null;
      return { estado, mensajes: await nuevos(), avisos: aviso.avisos.slice(antes), rechazo, llamadas: deEsteTurno.length };
    },

    // El dueño contesta a mano desde la app.
    dueno(texto) {
      return registrarSaliente({ m: { conversacion: id, texto, sentVia: null }, mem, config, modo: "simulador", ...(ahora ? { ahora: () => ahora } : {}) });
    },

    async datos() {
      return (await mem.conversacion(id))?.datos || {};
    },
  };
}
