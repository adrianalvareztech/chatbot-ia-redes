import assert from "node:assert/strict";
import { test } from "node:test";
import { accionesDisponibles } from "../src/nucleo/modulos.js";
import { contexto, esquema, sistema, transcript } from "../src/nucleo/prompt.js";
import { CONOCIMIENTO, REGLAS, configPrueba, modulosPrueba } from "./ayudas/falsos.js";

const config = configPrueba();
const acciones = accionesDisponibles(config, modulosPrueba());

test("32. el sistema lleva reglas, acciones y conocimiento en ese orden, con caché solo al final", () => {
  const bloques = sistema({ reglas: REGLAS, acciones, config, conocimiento: CONOCIMIENTO });
  assert.equal(bloques.length, 2);
  const [primero, segundo] = bloques;
  assert.ok(primero.text.indexOf(REGLAS) < primero.text.indexOf("mandar_link_cita"));
  assert.ok(primero.text.indexOf("mandar_link_cita") < primero.text.indexOf("REGLAS DEL SISTEMA"));
  assert.ok(segundo.text.includes("LO QUE SABES") && segundo.text.includes(CONOCIMIENTO));
  assert.equal(primero.cache_control, undefined);
  assert.deepEqual(segundo.cache_control, { type: "ephemeral" });
});

test("33. la fecha no aparece en el sistema", () => {
  const texto = sistema({ reglas: REGLAS, acciones, config, conocimiento: CONOCIMIENTO }).map((b) => b.text).join("\n");
  assert.doesNotMatch(texto, /20\d\d-\d\d-\d\d|Fecha/);
  const ctx = contexto({ conv: { canal: "instagram", nombre: "Ana", datos: {} }, config, ahora: new Date("2026-11-18T18:00:00Z") });
  assert.match(ctx, /Fecha y hora: .*2026/);
});

test("34. el esquema lista exactamente las acciones disponibles", () => {
  const e = esquema({ acciones, config });
  assert.deepEqual(e.properties.accion.enum.sort(), ["callarse", "mandar_link_cita", "ninguna", "pasar_al_dueno"]);
  assert.deepEqual(e.required.sort(), ["accion", "datos", "mensajes", "motivo"]);
  assert.equal(e.additionalProperties, false);
  assert.deepEqual(e.properties.datos.required, config.datos);
});

test("35. el transcript distingue persona, bot y dueño", () => {
  const t = transcript([
    { quien: "persona", texto: "Hola" },
    { quien: "bot", texto: "Qué tal" },
    { quien: "dueno", texto: "Yo te atiendo" },
    { quien: "persona", texto: "[adjunto:imagen] https://x/foto.jpg" },
  ]);
  assert.match(t, /^<platica>/);
  assert.match(t, /Persona: Hola/);
  assert.match(t, /Yo \(bot\): Qué tal/);
  assert.match(t, /Yo \(el dueño, a mano\): Yo te atiendo/);
  assert.match(t, /Persona: \(mandó un adjunto: imagen\)/);
  assert.match(t, /<\/platica>$/);
});
