import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { firmaValida } from "../src/nucleo/firma.js";

const cuerpo = '{"event":"message.received"}';
const secreto = "secreto-de-prueba";
const buena = createHmac("sha256", secreto).update(cuerpo).digest("hex");
const mala = (buena[0] === "a" ? "b" : "a") + buena.slice(1);

test("1. firma buena pasa; mala, vacía o sin secreto no", async () => {
  assert.equal(await firmaValida(cuerpo, buena, secreto), true);
  assert.equal(await firmaValida(cuerpo, mala, secreto), false);
  assert.equal(await firmaValida(cuerpo, "", secreto), false);
  assert.equal(await firmaValida(cuerpo, buena, ""), false);
  assert.equal(await firmaValida(`${cuerpo} `, buena, secreto), false);
});

test("2. acepta el prefijo sha256= y mayúsculas", async () => {
  assert.equal(await firmaValida(cuerpo, `sha256=${buena}`, secreto), true);
  assert.equal(await firmaValida(cuerpo, buena.toUpperCase(), secreto), true);
});
