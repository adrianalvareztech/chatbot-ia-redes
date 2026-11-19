// Piezas de mentiras para probar sin red: modelo, Zernio y aviso.
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

// La configuración de las pruebas del motor. Es fija y NO sale de src/negocio/config.js: así las
// pruebas del núcleo dan lo mismo sea cual sea tu negocio. Tu config.js la revisa negocio.test.js.
const BASE = {
  negocio: "Clínica de prueba",
  zona_horaria: "America/Mexico_City",
  modelo: "claude-sonnet-5-5",
  zernio: { cuentas: ["cuenta-1"] },
  modulos: { conocimiento: "archivo", agenda: "link", aviso: "ninguno", voz: false, pedidos: false, interesados: false, enlaces: false },
  notion: { fuentes: [] },
  agenda: { link: "https://cal.com/clinica/cita", tipo_de_cita: null, dias: 7 },
  aviso: { telegram_chat: "", correo: "" },
  pedidos: {
    moneda: "MXN",
    entregas: { recoger: { costo: 0, pide: ["nombre"] }, domicilio: { costo: 35, pide: ["nombre", "direccion"] } },
    pago: { texto: "Pagas al recibir.", link: "" },
    horario: null,
    cantidad_maxima: 20,
    total_maximo: null,
  },
  interesados: { campos: ["nombre", "servicio"] },
  acciones: {},
  mensajes: { maximo: 3, caracteres: 300, una_pregunta: true },
  espera_segundos: 10,
  espera_maxima_segundos: 25,
  historial: 30,
  dueno: {
    horas_silencio: 12,
    frase_regreso: "te dejo con mi asistente",
    frases_pase: ["Déjame revisarlo y te contesto en cuanto pueda", "Lo reviso y te escribo en un rato", "Dame chance de checarlo y te contesto pronto"],
  },
  adjuntos: "avisar",
  datos: ["nombre", "servicio"],
  revisor: { precios: "conocimiento", enlaces: [], palabras_prohibidas: [] },
};

export function configPrueba(cambios = {}) {
  return { ...structuredClone(BASE), ...cambios };
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

// Un turno armado con todo de mentiras, para probar un módulo. Devuelve lo necesario para ver qué pasó.
export async function armarTurno({ respuestas = [], modo = "encendido", config = configPrueba(), modulos = modulosPrueba(), ahora } = {}) {
  const { atenderTurno } = await import("../../src/nucleo/turno.js");
  const mem = memoriaPrueba();
  const modelo = modeloFalso(respuestas);
  const aviso = avisoFalso();
  const zernio = zernioFalso();
  const turno = () => atenderTurno({
    id: "conv-1", env: { MODO: modo }, config, mem, modulos, reglas: REGLAS,
    pedirAlModelo: modelo.pedir, enviar: zernio.enviar, avisar: aviso.avisar, pausa: async () => {}, ...(ahora ? { ahora } : {}),
  });
  // La persona escribe, el modelo "contesta" lo que le dictes y corre el turno.
  const dice = async (texto, ...salidas) => {
    respuestas.push(...salidas);
    await mem.recibir(entrante(texto));
    return turno();
  };
  return { mem, modelo, aviso, zernio, config, dice, enviados: () => zernio.envios.map((e) => e.texto) };
}
