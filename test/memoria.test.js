import assert from "node:assert/strict";
import { test } from "node:test";
import { entrante, memoriaPrueba } from "./ayudas/falsos.js";

test("9. el mismo evento dos veces: la segunda es repetido", async () => {
  const mem = memoriaPrueba();
  assert.equal(await mem.eventoNuevo("ev-1"), true);
  assert.equal(await mem.eventoNuevo("ev-1"), false);
  await mem.olvidarEvento("ev-1");
  assert.equal(await mem.eventoNuevo("ev-1"), true, "olvidado, el reintento sí entra");
});

test("10. recibir crea la conversación y actualiza ultimo_entrante", async () => {
  const mem = memoriaPrueba();
  await mem.recibir(entrante("Hola", { fecha: "2026-11-18T10:00:00.000Z" }));
  assert.equal((await mem.conversacion("conv-1")).ultimo_entrante, "2026-11-18T10:00:00.000Z");
  await mem.recibir(entrante("Sigo aquí", { fecha: "2026-11-18T11:00:00.000Z", nombre: null }));
  const c = await mem.conversacion("conv-1");
  assert.equal(c.ultimo_entrante, "2026-11-18T11:00:00.000Z");
  assert.equal(c.nombre, "Ana", "un nombre vacío no borra el que ya estaba");
  assert.deepEqual(c.datos, {});
});

test("11. hilo respeta el orden y deja fuera los simulados cuando se pide", async () => {
  const mem = memoriaPrueba();
  await mem.recibir(entrante("uno"));
  await mem.anotar("conv-1", "bot", "dos", "simulado");
  await mem.anotar("conv-1", "dueno", "tres");
  assert.deepEqual((await mem.hilo("conv-1", 30, false)).map((h) => h.texto), ["uno", "tres"]);
  assert.deepEqual((await mem.hilo("conv-1", 30, true)).map((h) => h.texto), ["uno", "dos", "tres"]);
  assert.deepEqual((await mem.hilo("conv-1", 2, true)).map((h) => h.texto), ["dos", "tres"]);
});

test("12. callar y soltar", async () => {
  const mem = memoriaPrueba();
  await mem.recibir(entrante("Hola"));
  await mem.callar("conv-1", "2030-01-01T00:00:00.000Z", "dueno");
  let c = await mem.conversacion("conv-1");
  assert.equal(c.callado_hasta, "2030-01-01T00:00:00.000Z");
  assert.equal(c.callado_motivo, "dueno");
  await mem.soltar("conv-1");
  c = await mem.conversacion("conv-1");
  assert.equal(c.callado_hasta, null);
  assert.equal(c.callado_motivo, null);
});

test("13. guardarDatos mezcla sin borrar lo anterior", async () => {
  const mem = memoriaPrueba();
  await mem.recibir(entrante("Hola"));
  await mem.guardarDatos("conv-1", { nombre: "Ana" });
  await mem.guardarDatos("conv-1", { servicio: "limpieza", nombre: null });
  assert.deepEqual((await mem.conversacion("conv-1")).datos, { nombre: "Ana", servicio: "limpieza" });
});

test("14. enviosRecientes incluye los que se están enviando", async () => {
  const mem = memoriaPrueba();
  await mem.recibir(entrante("Hola"));
  await mem.anotar("conv-1", "bot", "mandando", "enviando");
  const id = await mem.anotar("conv-1", "bot", "mandado", "enviando");
  await mem.marcar(id, "enviado", { externo: "z-1" });
  await mem.anotar("conv-1", "bot", "falló", "fallo");
  assert.deepEqual((await mem.enviosRecientes("conv-1", 15)).sort(), ["mandado", "mandando"]);
  assert.equal(await mem.enviadosDelMes(), 1);
});
