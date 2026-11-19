// Piezas de mentiras para probar sin red: modelo, Zernio y aviso.
import base from "../../src/negocio/config.js";
import agendaLink from "../../src/modulos/agenda-link.js";
import { memoria } from "../../src/nucleo/memoria.js";
import { d1Falso } from "./d1.js";

export const CONOCIMIENTO = `# Clínica de prueba
Limpieza dental: $800 MXN
Blanqueamiento: $3,500 MXN
Teléfono: 664 123 4567
Correo: hola@clinicaprueba.com
Sitio: https://clinicaprueba.com/precios`;

export const REGLAS = "Eres el asistente de la clínica de prueba.";

// Una copia de config.js con lo que cada prueba quiera cambiar.
export function configPrueba(cambios = {}) {
  const c = structuredClone(base);
  c.zernio.cuentas = ["cuenta-1"];
  c.agenda.link = "https://cal.com/clinica/cita";
  return { ...c, ...cambios };
}

export function modulosPrueba(cambios = {}) {
  return {
    conocimiento: { nombre: "conocimiento-prueba", leer: async () => CONOCIMIENTO },
    agenda: agendaLink,
    aviso: null,
    voz: null,
    ...cambios,
  };
}

// Cada respuesta puede ser un objeto (la salida), un Error (se lanza) o una función (corre en la llamada).
export function modeloFalso(respuestas) {
  const llamadas = [];
  const pedir = async (env, args) => {
    llamadas.push(args);
    let r = respuestas.shift();
    if (typeof r === "function") r = await r(args);
    if (r instanceof Error) throw r;
    return { salida: r, uso: { llamadas: 1, entrada: 100, cache_leida: 50, cache_nueva: 0, salida: 20 } };
  };
  return { pedir, llamadas };
}

export function zernioFalso({ falla = false } = {}) {
  const envios = [];
  const enviar = async (cuenta, conversacion, texto, idem) => {
    if (falla) throw new Error("Zernio respondió 500");
    envios.push({ cuenta, conversacion, texto, idem });
    return { id: `z-${envios.length}` };
  };
  return { enviar, envios };
}

export function avisoFalso() {
  const avisos = [];
  return { avisar: async (t) => { avisos.push(t); }, avisos };
}

export function memoriaPrueba() {
  return memoria(d1Falso());
}

// Un mensaje entrante ya normalizado.
export function entrante(texto, cambios = {}) {
  return {
    tipo: "entrante", conversacion: "conv-1", cuenta: "cuenta-1", canal: "instagram",
    persona: "p-1", nombre: "Ana", usuario: "ana", texto, adjunto: null, fecha: new Date().toISOString(), ...cambios,
  };
}

export const respuesta = (mensajes, accion = "ninguna", extra = {}) => ({
  mensajes, accion, motivo: "prueba", datos: { nombre: null, servicio: null }, ...extra,
});
