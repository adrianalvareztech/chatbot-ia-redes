// Pláticas de prueba de TU negocio, sin llaves ni internet. Usan tu config.js, tu prompt.js y tu
// conocimiento.md de verdad; lo único falso es el modelo (ver test/ayudas/platica.js).
// Cada prueba es un caso de la sección 12 de tu PRD. Las mismas pláticas, para correrlas con el
// bot de verdad, están en test/guiones/.
//
// EJEMPLO: son las de la clínica dental inventada. La skill /configurar-bot las reescribe con tu negocio.
import assert from "node:assert/strict";
import { test } from "node:test";
import { platica } from "./ayudas/platica.js";

test("mi negocio · camino ideal: pregunta, precio de Lo que sabe y link para agendar", async () => {
  const p = await platica();
  let r = await p.turno("Hola, cuánto cuesta una limpieza?", p.dice(["La limpieza cuesta $800 MXN. El dentista lo confirma en la valoración", "Te gustaría agendar?"], "ninguna", { datos: { servicio: "limpieza" } }));
  assert.equal(r.estado, "contestó");
  assert.equal(r.rechazo, null);
  r = await p.turno("Sí, me gustaría agendar", p.dice(["Va, aquí eliges tu horario"], "mandar_link_cita"));
  assert.equal(r.estado, "contestó");
  assert.ok(r.mensajes.at(-1).startsWith(p.config.agenda.link), "el link lo pone el sistema");
  assert.equal((await p.datos()).servicio, "limpieza");
});

test("mi negocio · un precio que no está en Lo que sabe no sale", async () => {
  const p = await platica();
  const r = await p.turno("Cuánto cuestan los brackets?", p.dice(["Los brackets cuestan $15,000 MXN"]), p.dice(["eso no lo sé"], "pasar_al_dueno"));
  assert.match(r.rechazo, /precio que no está en "Lo que sabes"/);
  assert.equal(r.estado, "pasó al dueño");
  assert.ok(p.config.dueno.frases_pase.includes(r.mensajes[0]));
  assert.match(r.avisos.at(-1), /Te toca contestar/);
});

test("mi negocio · una urgencia pasa a una persona y el bot se calla", async () => {
  const p = await platica();
  let r = await p.turno("Tengo un dolor muy fuerte y se me hinchó la cara", p.dice(["x"], "pasar_al_dueno"));
  assert.equal(r.estado, "pasó al dueño");
  assert.equal(r.avisos.length, 1);
  r = await p.turno("Hola? sigue ahí?", p.dice(["Aquí sigo"]));
  assert.equal(r.estado, "callado");
  assert.deepEqual(r.mensajes, []);
});

test("mi negocio · una foto sin texto: el bot no contesta y le avisa al dueño", async () => {
  const p = await platica();
  const r = await p.adjunto("imagen");
  assert.equal(r.estado, "adjunto sin texto");
  assert.deepEqual(r.mensajes, []);
  assert.match(r.avisos[0], /mandó un adjunto/);
});

test("mi negocio · le habla un conocido del dueño: el bot se calla", async () => {
  const p = await platica();
  const r = await p.turno("Qué onda doc, soy tu primo, márcame", p.dice(["x"], "callarse"));
  assert.equal(r.estado, "se calló");
  assert.deepEqual(r.mensajes, []);
});

test("mi negocio · el dueño contesta a mano: el bot se calla; con la frase de regreso, retoma", async () => {
  const p = await platica();
  await p.turno("Hola", p.dice(["Hola, qué necesitas?"]));
  assert.equal(await p.dueno("Hola, soy la doctora, yo te atiendo"), "el dueño tomó la plática");
  let r = await p.turno("Gracias doctora", p.dice(["De nada"]));
  assert.equal(r.estado, "callado");
  assert.equal(await p.dueno(`Listo, ${p.config.dueno.frase_regreso}`), "contestar ahora");
  r = await p.turno("Y los sábados abren?", p.dice(["Sí, los sábados abrimos de 9:00 a 14:00"]));
  assert.equal(r.estado, "contestó");
});
