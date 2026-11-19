import assert from "node:assert/strict";
import { test } from "node:test";
import { ErrorModelo } from "../src/nucleo/modelo.js";
import { atenderTurno, registrarSaliente } from "../src/nucleo/turno.js";
import {
  REGLAS, avisoFalso, configPrueba, entrante, memoriaPrueba, modeloFalso, modulosPrueba, respuesta, zernioFalso,
} from "./ayudas/falsos.js";

// Arma un turno con todo de mentiras. Devuelve lo necesario para revisar qué pasó.
function preparar({ respuestas = [respuesta(["Hola, qué servicio buscas?"])], modo = "encendido", config = configPrueba(), modulos = modulosPrueba(), zernio = zernioFalso() } = {}) {
  const mem = memoriaPrueba();
  const modelo = modeloFalso(respuestas);
  const aviso = avisoFalso();
  const turno = (cambios = {}) => atenderTurno({
    id: "conv-1", env: { MODO: modo }, config, mem, modulos, reglas: REGLAS,
    pedirAlModelo: modelo.pedir, enviar: zernio.enviar, avisar: aviso.avisar, pausa: async () => {}, ...cambios,
  });
  return { mem, modelo, aviso, zernio, turno, config };
}

const bot = async (mem, conSimulados = false) => (await mem.hilo("conv-1", 50, conSimulados)).filter((h) => h.quien === "bot");

test("36. camino feliz: un entrante, una respuesta mandada y anotada como enviado", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "contestó");
  assert.deepEqual(t.zernio.envios.map((e) => e.texto), ["Hola, qué servicio buscas?"]);
  assert.equal(t.zernio.envios[0].cuenta, "cuenta-1");
  const filas = (await t.mem.hilo("conv-1")).filter((h) => h.quien === "bot");
  assert.equal(filas.length, 1);
  const estado = await t.mem.enviosRecientes("conv-1", 5);
  assert.deepEqual(estado, ["Hola, qué servicio buscas?"]);
});

test("37. tres entrantes seguidos: una sola respuesta", async () => {
  const t = preparar();
  for (const m of ["Hola", "una pregunta", "cuánto cuesta la limpieza?"]) await t.mem.recibir(entrante(m));
  assert.equal(await t.turno(), "contestó");
  assert.equal(t.modelo.llamadas.length, 1);
  assert.match(t.modelo.llamadas[0].usuario, /Hola[\s\S]*una pregunta[\s\S]*cuánto cuesta/);
  assert.equal(t.zernio.envios.length, 1);
});

test("38. llega un entrante mientras el modelo contesta: esa respuesta no sale", async () => {
  const t = preparar({
    respuestas: [async () => { await t.mem.recibir(entrante("ah, y otra cosa")); return respuesta(["Claro"]); }],
  });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "llegó otro mensaje");
  assert.equal(t.zernio.envios.length, 0);
});

test("39. el dueño escribe mientras el modelo contesta: no sale nada", async () => {
  const t = preparar({
    respuestas: [async () => {
      await registrarSaliente({ m: { conversacion: "conv-1", texto: "Yo te atiendo", sentVia: null }, mem: t.mem, config: t.config, modo: "encendido" });
      return respuesta(["Claro"]);
    }],
  });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "callado");
  assert.equal(t.zernio.envios.length, 0);
});

test("40. conversación callada: no se llama al modelo", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola"));
  await t.mem.callar("conv-1", "2099-01-01T00:00:00.000Z", "dueno");
  assert.equal(await t.turno(), "callado");
  assert.equal(t.modelo.llamadas.length, 0);
});

test("41. callado vencido: contesta y el contexto lleva la nota de regreso", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola"));
  await t.mem.callar("conv-1", "2020-01-01T00:00:00.000Z", "dueno");
  assert.equal(await t.turno(), "contestó");
  assert.match(t.modelo.llamadas[0].usuario, /el dueño atendió esta plática a mano/);
  assert.equal((await t.mem.conversacion("conv-1")).callado_hasta, null);
});

test("42. el revisor rechaza y la segunda pasa: dos llamadas, una respuesta", async () => {
  const t = preparar({ respuestas: [respuesta(["Qué servicio?", "Y qué día?"]), respuesta(["Qué servicio buscas?"])] });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "contestó");
  assert.equal(t.modelo.llamadas.length, 2);
  assert.match(t.modelo.llamadas[1].usuario, /se rechazó por: .*preguntas/);
  assert.deepEqual(t.zernio.envios.map((e) => e.texto), ["Qué servicio buscas?"]);
});

test("43. el revisor rechaza dos veces: frase de pase, callada y aviso con los motivos", async () => {
  const mala = respuesta(["Qué servicio?", "Y qué día?"]);
  const t = preparar({ respuestas: [mala, mala] });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "pasó al dueño");
  assert.ok(t.config.dueno.frases_pase.includes(t.zernio.envios[0].texto));
  assert.equal((await t.mem.conversacion("conv-1")).callado_motivo, "pase");
  assert.match(t.aviso.avisos.at(-1), /preguntas/);
});

test("44. el modelo lanza error: reintentar sin mandar nada; al tercer fallo, aviso", async () => {
  const error = () => new ErrorModelo("Claude no contestó (529)");
  const t = preparar({ respuestas: [error(), error(), error()] });
  await t.mem.recibir(entrante("Hola"));
  assert.deepEqual(await t.turno({ intento: 0 }), { reintentar: 60000 });
  assert.deepEqual(await t.turno({ intento: 1 }), { reintentar: 60000 });
  assert.equal(t.aviso.avisos.length, 0);
  assert.equal(await t.turno({ intento: 2 }), "falló el modelo");
  assert.equal(t.zernio.envios.length, 0);
  assert.match(t.aviso.avisos[0], /No logré contestarle/);
});

test("45. pasar_al_dueno: frase fija, callada con motivo pase y aviso con el último mensaje", async () => {
  const t = preparar({ respuestas: [respuesta(["texto del modelo"], "pasar_al_dueno")] });
  await t.mem.recibir(entrante("Quiero poner una queja"));
  assert.equal(await t.turno(), "pasó al dueño");
  assert.ok(t.config.dueno.frases_pase.includes(t.zernio.envios[0].texto));
  const c = await t.mem.conversacion("conv-1");
  assert.equal(c.callado_motivo, "pase");
  assert.ok(c.callado_hasta > new Date().toISOString());
  assert.match(t.aviso.avisos[0], /Quiero poner una queja/);
});

test("46. acción con link: el link sale como mensaje aparte, puesto por el código", async () => {
  const t = preparar({ respuestas: [respuesta(["Va, aquí eliges tu horario"], "mandar_link_cita")] });
  await t.mem.recibir(entrante("Quiero agendar"));
  assert.equal(await t.turno(), "contestó");
  assert.deepEqual(t.zernio.envios.map((e) => e.texto), [
    "Va, aquí eliges tu horario",
    "https://cal.com/clinica/cita?metadata[conversacion]=conv-1",
  ]);
});

test("47. fuera de ventana: no manda", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola", { fecha: new Date(Date.now() - 25 * 3600000).toISOString() }));
  assert.equal(await t.turno(), "fuera de ventana");
  assert.equal(t.modelo.llamadas.length, 0);
});

test("48. solo-avisos: no llama a Zernio, avisa al dueño y los mensajes quedan simulado", async () => {
  const t = preparar({ modo: "solo-avisos" });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "contestó");
  assert.equal(t.zernio.envios.length, 0);
  assert.match(t.aviso.avisos[0], /\[solo avisos\][\s\S]*Hola, qué servicio buscas\?/);
  assert.equal((await bot(t.mem)).length, 0, "fuera del transcript");
  assert.equal((await bot(t.mem, true)).length, 1);
});

test("49. simulador: no llama a Zernio y la respuesta queda en el hilo", async () => {
  const t = preparar({ modo: "simulador" });
  await t.mem.recibir(entrante("Hola"));
  assert.equal(await t.turno(), "contestó");
  assert.equal(t.zernio.envios.length, 0);
  assert.deepEqual((await bot(t.mem, true)).map((h) => h.texto), ["Hola, qué servicio buscas?"]);
});

test("50. Zernio falla al mandar: el mensaje queda en fallo y hay aviso", async () => {
  const t = preparar({ zernio: zernioFalso({ falla: true }) });
  await t.mem.recibir(entrante("Hola"));
  await t.turno();
  assert.equal((await bot(t.mem)).length, 0, "lo que falló no cuenta como dicho");
  assert.match(t.aviso.avisos[0], /No pude mandarle/);
});

test("51. adjunto sin texto: aviso, sin respuesta", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("", { adjunto: { tipo: "imagen", url: "https://x/foto.jpg" } }));
  assert.equal(await t.turno(), "adjunto sin texto");
  assert.equal(t.modelo.llamadas.length, 0);
  assert.equal(t.zernio.envios.length, 0);
  assert.match(t.aviso.avisos[0], /imagen/);
});

test("52. el dueño escribe la frase de regreso con un mensaje pendiente: el bot contesta", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola"));
  await registrarSaliente({ m: { conversacion: "conv-1", texto: "Hola, soy el doctor", sentVia: null }, mem: t.mem, config: t.config, modo: "encendido" });
  await t.mem.recibir(entrante("Y cuánto cuesta la limpieza?"));
  assert.equal(await t.turno(), "callado");
  const r = await registrarSaliente({ m: { conversacion: "conv-1", texto: "Te dejo con mi asistente", sentVia: null }, mem: t.mem, config: t.config, modo: "encendido" });
  assert.equal(r, "contestar ahora");
  assert.equal(await t.turno(), "contestó");
  assert.equal(t.zernio.envios.length, 1);
});

test("el eco del bot no calla la plática", async () => {
  const t = preparar();
  await t.mem.recibir(entrante("Hola"));
  await t.turno();
  const r = await registrarSaliente({ m: { conversacion: "conv-1", texto: "Hola, qué servicio buscas?", sentVia: null }, mem: t.mem, config: t.config, modo: "encendido" });
  assert.equal(r, "eco del bot");
  assert.equal((await t.mem.conversacion("conv-1")).callado_hasta, null);
});
