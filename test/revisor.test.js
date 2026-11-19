import assert from "node:assert/strict";
import { test } from "node:test";
import { accionesDisponibles } from "../src/nucleo/modulos.js";
import { recortar, revisar } from "../src/nucleo/revisor.js";
import { CONOCIMIENTO, configPrueba, modulosPrueba, respuesta } from "./ayudas/falsos.js";

const config = configPrueba();
const acciones = accionesDisponibles(config, modulosPrueba());
const opciones = (cambios = {}) => ({ acciones, config, conocimiento: CONOCIMIENTO, extras: [], yaDijo: [], ...cambios });
const motivos = (mensajes, cambios, accion) => revisar(respuesta(mensajes, accion), opciones(cambios)).motivos;

test("20. una respuesta limpia pasa", () => {
  const r = revisar(respuesta(["Hola, claro que sí", "Qué servicio te interesa?"]), opciones());
  assert.equal(r.ok, true, r.motivos.join("; "));
});

test("21. precio del conocimiento pasa; inventado no; con 'nunca' ninguno", () => {
  assert.deepEqual(motivos(["La limpieza cuesta $800 MXN"]), []);
  assert.equal(motivos(["La limpieza cuesta $650"]).length, 1);
  const nunca = { config: { ...config, revisor: { ...config.revisor, precios: "nunca" } } };
  assert.equal(motivos(["La limpieza cuesta $800 MXN"], nunca).length, 1);
  assert.equal(motivos(["La limpieza cuesta $650"], nunca).length, 1);
});

test("22. $1,200, 1200 pesos y 1 200 MXN son la misma cifra", () => {
  const conocimiento = "Ortodoncia: $1,200 al mes";
  for (const m of ["Son $1,200 al mes", "Son 1200 pesos al mes", "Son 1 200 MXN al mes"]) {
    assert.deepEqual(motivos([m], { conocimiento }), [], m);
  }
  assert.equal(motivos(["Son 1300 pesos"], { conocimiento }).length, 1);
});

test("23. link del conocimiento pasa; link inventado y dominio suelto no", () => {
  assert.deepEqual(motivos(["Aquí están: https://clinicaprueba.com/precios"]), []);
  assert.equal(motivos(["Entra a https://otra.com/promo"]).length, 1);
  assert.equal(motivos(["Búscanos en clinicafalsa.mx"]).length, 1);
  const enlaces = { config: { ...config, revisor: { ...config.revisor, enlaces: ["https://maps.app.goo.gl/abc"] } } };
  assert.deepEqual(motivos(["Mapa: https://maps.app.goo.gl/abc"], enlaces), []);
});

test("24. teléfono y correo inventados se rechazan", () => {
  assert.deepEqual(motivos(["Llámanos al 664 123 4567 o a hola@clinicaprueba.com"]), []);
  assert.equal(motivos(["Llámanos al 55 9876 5432"]).length, 1);
  assert.equal(motivos(["Escríbenos a citas@clinicaprueba.com"]).length, 1);
});

test("25. una acción que no existe se rechaza", () => {
  const r = revisar(respuesta(["Va"], "mandar_cupon"), opciones());
  assert.equal(r.ok, false);
  assert.match(r.motivos[0], /no existe/);
});

test("26. cuatro mensajes o uno muy largo es solo de forma, y recortar lo salva", () => {
  const cuatro = revisar(respuesta(["Hola", "Claro", "Mira", "Qué día te queda?"]), opciones());
  assert.equal(cuatro.ok, false);
  assert.equal(cuatro.soloForma, true);
  assert.deepEqual(recortar(cuatro.salida, config).mensajes, ["Hola", "Qué día te queda?"]);

  const largo = `${"Te cuento cómo funciona la limpieza. ".repeat(10)}Qué día te queda?`;
  const r = revisar(respuesta([largo]), opciones());
  assert.equal(r.soloForma, true);
  const salvado = recortar(r.salida, config);
  assert.ok(salvado.mensajes[0].length <= config.mensajes.caracteres);
});

test("27. dos preguntas se rechazan", () => {
  const r = revisar(respuesta(["Qué servicio buscas?", "Y para qué día?"]), opciones());
  assert.equal(r.ok, false);
  assert.equal(r.soloForma, false);
});

test("28. pasar_al_dueno sale con una frase fija que no se ha usado", () => {
  const [usada, ...resto] = config.dueno.frases_pase;
  for (let i = 0; i < 10; i++) {
    const r = revisar(respuesta(["lo que sea"], "pasar_al_dueno"), opciones({ yaDijo: [usada] }));
    assert.equal(r.ok, true);
    assert.equal(r.salida.mensajes.length, 1);
    assert.ok(resto.includes(r.salida.mensajes[0]));
  }
});

test("29. callarse sale sin mensajes", () => {
  const r = revisar(respuesta(["Jaja qué onda"], "callarse"), opciones());
  assert.equal(r.ok, true);
  assert.deepEqual(r.salida.mensajes, []);
});

test("30. repetir un mensaje largo de la misma plática se rechaza", () => {
  const largo = "La limpieza dura unos 45 minutos y la hace el dentista";
  assert.equal(motivos([largo], { yaDijo: [largo] }).length, 1);
  assert.deepEqual(motivos(["Va, perfecto"], { yaDijo: ["Va, perfecto"] }), [], "lo corto sí se puede repetir");
});

test("31. agendar con un horario fuera de la lista se rechaza", () => {
  const conAgendar = { ...acciones, agendar: { descripcion: "agenda" } };
  const horarios = ["2026-11-19T10:00:00.000-06:00"];
  const cita = (inicio) => ({ ...respuesta(["Listo, te agendo"], "agendar"), cita: { inicio, nombre: "Ana", correo: "ana@correo.com" } });
  const correoEnFuente = { conocimiento: `${CONOCIMIENTO}\nana@correo.com` };
  assert.equal(revisar(cita(horarios[0]), opciones({ acciones: conAgendar, horarios, ...correoEnFuente })).ok, true);
  assert.equal(revisar(cita("2026-11-19T11:00:00.000-06:00"), opciones({ acciones: conAgendar, horarios, ...correoEnFuente })).ok, false);
});

test("limpieza: sin ¿ ni ¡ al inicio y sin guion largo", () => {
  const r = revisar(respuesta(["¡Hola \u2014 qué tal", "¿Qué servicio buscas?"]), opciones());
  assert.deepEqual(r.salida.mensajes, ["Hola, qué tal", "Qué servicio buscas?"]);
});
