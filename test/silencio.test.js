import assert from "node:assert/strict";
import { test } from "node:test";
import { dentroDeVentana, esRegreso, estaCallado, hastaCuando, quienMando } from "../src/nucleo/silencio.js";

const envios = ["Claro, te paso el link"];

test("15. las seis filas de la tabla de quién mandó", () => {
  assert.equal(quienMando({ sentVia: "human", texto: "Claro, te paso el link" }, envios), "dueno");
  assert.equal(quienMando({ sentVia: null, texto: "Yo te atiendo" }, envios), "dueno");
  assert.equal(quienMando({ sentVia: null, texto: "Claro, te paso el link" }, envios), "bot");
  assert.equal(quienMando({ sentVia: "api", texto: "Claro, te paso el link" }, envios), "bot");
  assert.equal(quienMando({ sentVia: "api", texto: "Promo de la semana" }, envios), "otra");
  assert.equal(quienMando({ sentVia: "workflow", texto: "Claro, te paso el link" }, envios), "otra");
  assert.equal(quienMando({ texto: "Yo te atiendo" }, envios), "dueno", "sin sentVia cuenta como null");
});

test("16. el eco con espacios o mayúsculas distintas sigue siendo eco", () => {
  assert.equal(quienMando({ sentVia: null, texto: "  claro,  TE paso el link " }, envios), "bot");
});

test("17. esRegreso sin acentos ni mayúsculas; una frase parecida no cuenta", () => {
  const frase = "te dejo con mi asistente";
  assert.equal(esRegreso("Listo! Te dejo con mi ASISTENTE", frase), true);
  assert.equal(esRegreso("té déjo con mí asistente", frase), true);
  assert.equal(esRegreso("te dejo con el asistente", frase), false);
  assert.equal(esRegreso("hola", ""), false);
});

test("18. estaCallado antes y después de vencer; horas = 0 no vence", () => {
  const ahora = new Date("2026-11-18T12:00:00.000Z");
  const conv = { callado_hasta: hastaCuando(ahora, 12), callado_motivo: "dueno" };
  assert.equal(estaCallado(conv, ahora), "dueno");
  assert.equal(estaCallado(conv, new Date("2026-11-19T00:00:01.000Z")), null);
  const siempre = { callado_hasta: hastaCuando(ahora, 0), callado_motivo: "dueno" };
  assert.equal(estaCallado(siempre, new Date("2099-01-01T00:00:00.000Z")), "dueno");
  assert.equal(estaCallado({ callado_hasta: null }, ahora), null);
});

test("19. dentroDeVentana a 23 h sí, a 24 h no", () => {
  const ahora = new Date("2026-11-18T12:00:00.000Z");
  const hace = (h) => ({ ultimo_entrante: new Date(ahora.getTime() - h * 3600000).toISOString() });
  assert.equal(dentroDeVentana(hace(23), ahora), true);
  assert.equal(dentroDeVentana(hace(24), ahora), false);
  assert.equal(dentroDeVentana({}, ahora), false);
});
