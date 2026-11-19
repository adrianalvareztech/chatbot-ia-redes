// Revisa lo que Claude Code escribió para tu negocio en src/negocio/. Si algo falla aquí,
// el mensaje dice qué arreglar.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import config from "../src/negocio/config.js";
import reglas from "../src/negocio/prompt.js";
import { CATALOGO } from "../src/nucleo/modulos.js";

const uno = (valor, opciones, campo) => assert.ok(opciones.includes(valor), `${campo} = ${JSON.stringify(valor)}; opciones: ${opciones.join(", ")}`);
const texto = (v, campo) => assert.ok(typeof v === "string" && v.trim(), `${campo} tiene que ser un texto`);
const numero = (v, campo, min = 0) => assert.ok(Number.isFinite(v) && v >= min, `${campo} tiene que ser un número de ${min} para arriba`);

test("53. config.js tiene todas las llaves y valores válidos", () => {
  texto(config.negocio, "negocio");
  assert.doesNotThrow(() => new Intl.DateTimeFormat("es-MX", { timeZone: config.zona_horaria }), "zona_horaria no existe");
  assert.match(config.modelo, /^claude-/, "modelo");
  assert.ok(Array.isArray(config.zernio?.cuentas) && config.zernio.cuentas.length, "zernio.cuentas necesita al menos una cuenta");
  uno(config.modulos.conocimiento, ["archivo", "notion"], "modulos.conocimiento");
  uno(config.modulos.agenda, ["ninguna", "link", "cal"], "modulos.agenda");
  uno(config.modulos.aviso, ["ninguno", "telegram", "correo"], "modulos.aviso");
  uno(config.modulos.voz, [true, false], "modulos.voz");
  if (config.modulos.conocimiento === "notion") assert.ok(config.notion.fuentes.length, "notion.fuentes necesita al menos un id");
  if (config.modulos.agenda === "link") assert.match(config.agenda.link, /^https:\/\//, "agenda.link");
  if (config.modulos.agenda === "cal") assert.ok(config.agenda.tipo_de_cita, "agenda.tipo_de_cita");
  for (const [nombre, a] of Object.entries(config.acciones || {})) {
    assert.match(nombre, /^[a-z_]+$/, `acción ${nombre}: solo minúsculas y guion bajo`);
    texto(a.descripcion, `acciones.${nombre}.descripcion`);
    assert.match(a.link || "", /^https?:\/\//, `acciones.${nombre}.link`);
  }
  numero(config.mensajes.maximo, "mensajes.maximo", 1);
  numero(config.mensajes.caracteres, "mensajes.caracteres", 50);
  assert.equal(typeof config.mensajes.una_pregunta, "boolean", "mensajes.una_pregunta");
  numero(config.espera_segundos, "espera_segundos");
  assert.ok(config.espera_maxima_segundos >= config.espera_segundos, "espera_maxima_segundos no puede ser menor que espera_segundos");
  numero(config.historial, "historial", 1);
  numero(config.dueno.horas_silencio, "dueno.horas_silencio");
  texto(config.dueno.frase_regreso, "dueno.frase_regreso");
  assert.ok(config.dueno.frases_pase.length >= 2, "dueno.frases_pase necesita al menos dos frases");
  uno(config.adjuntos, ["avisar", "ignorar"], "adjuntos");
  assert.ok(Array.isArray(config.datos) && config.datos.every((d) => /^[a-z_]+$/.test(d)), "datos: lista de nombres en minúsculas");
  uno(config.revisor.precios, ["conocimiento", "nunca"], "revisor.precios");
  assert.ok(Array.isArray(config.revisor.enlaces), "revisor.enlaces");
  assert.ok(Array.isArray(config.revisor.palabras_prohibidas), "revisor.palabras_prohibidas");
});

test("54. cada módulo prendido existe", () => {
  for (const [tipo, opciones] of Object.entries(CATALOGO)) {
    assert.ok(String(config.modulos[tipo]) in opciones, `no hay módulo "${config.modulos[tipo]}" para ${tipo}`);
  }
});

test("55. prompt.js no trae precios ni links (van en el conocimiento)", () => {
  texto(reglas, "prompt.js");
  assert.doesNotMatch(reglas, /\$\s?\d|\d\s?(pesos|mxn|usd|d[oó]lares)/i, "prompt.js trae un precio: muévelo a Lo que sabe");
  assert.doesNotMatch(reglas, /https?:\/\/|www\./i, "prompt.js trae un link: muévelo a Lo que sabe o a config.acciones");
});

test("56. con conocimiento = archivo, conocimiento.md existe y no está vacío", () => {
  if (config.modulos.conocimiento !== "archivo") return;
  const archivo = new URL("../src/negocio/conocimiento.md", import.meta.url);
  assert.ok(existsSync(archivo), "falta src/negocio/conocimiento.md");
  const contenido = readFileSync(archivo, "utf8").replace(/<!--[\s\S]*?-->/g, "").trim();
  assert.ok(contenido.length > 50, "conocimiento.md está vacío");
});
