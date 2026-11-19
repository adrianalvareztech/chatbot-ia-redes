// Revisa lo que Claude Code escribió para tu negocio en src/negocio/. Si algo falla aquí,
// el mensaje dice qué arreglar.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import config from "../src/negocio/config.js";
import reglas from "../src/negocio/prompt.js";
import { enlacesDe } from "../src/modulos/enlaces.js";
import { leerMenu } from "../src/modulos/pedidos.js";
import { ACCIONES_DEL_NUCLEO, CATALOGO, accionesDisponibles, cargar } from "../src/nucleo/modulos.js";

const leer = (ruta) => readFileSync(new URL(ruta, import.meta.url), "utf8");
const sinNotas = (t) => t.replace(/<!--[\s\S]*?-->/g, "").trim();
const loQueSabe = () => (existsSync(new URL("../src/negocio/conocimiento.md", import.meta.url)) ? sinNotas(leer("../src/negocio/conocimiento.md")) : "");

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
  uno(config.modulos.pedidos, [true, false], "modulos.pedidos");
  uno(config.modulos.interesados, [true, false], "modulos.interesados");
  uno(config.modulos.enlaces, [true, false], "modulos.enlaces");
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
  for (const reservado of ["ficha_enviada", "ultimo_pedido"]) assert.ok(!config.datos.includes(reservado), `datos: "${reservado}" lo usa el sistema, ponle otro nombre`);
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

test("57. pedidos: las formas de entrega están completas y el menú se puede leer", () => {
  if (!config.modulos.pedidos) return;
  const p = config.pedidos || {};
  const entregas = Object.entries(p.entregas || {});
  assert.ok(entregas.length, "pedidos.entregas necesita al menos una forma de entrega (por ejemplo recoger)");
  for (const [nombre, e] of entregas) {
    numero(e.costo, `pedidos.entregas.${nombre}.costo`);
    for (const d of e.pide || []) assert.ok(config.datos.includes(d), `pedidos.entregas.${nombre}.pide trae "${d}", que no está en datos`);
  }
  assert.equal(typeof (p.moneda ?? ""), "string", "pedidos.moneda");
  if (p.pago?.link) assert.match(p.pago.link, /^https:\/\//, "pedidos.pago.link");
  for (const [dia, tramos] of Object.entries(p.horario || {})) {
    uno(dia.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(), ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"], "pedidos.horario (día)");
    assert.match(tramos, /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}(\s*,\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})*$/, `pedidos.horario.${dia}: escribe "08:00-20:00"`);
  }
  const menu = leerMenu(loQueSabe());
  assert.ok(menu.length, "no encuentro nada que se pueda pedir en conocimiento.md: cada artículo va en una tabla con columna Precio, o en una línea \"Nombre: $precio\"");
});

test("58. interesados: los datos obligatorios están en datos", () => {
  if (!config.modulos.interesados) return;
  const campos = config.interesados?.campos || [];
  assert.ok(campos.length, "interesados.campos necesita al menos un dato");
  for (const c of campos) assert.ok(config.datos.includes(c), `interesados.campos trae "${c}", que no está en datos`);
});

test("59. enlaces: hay al menos un link que mandar", () => {
  if (!config.modulos.enlaces) return;
  assert.ok(enlacesDe(loQueSabe(), config).size, "enlaces está prendido y no hay ningún link en conocimiento.md ni en revisor.enlaces");
});

test("60. el prompt y las piezas prendidas nombran las mismas acciones", () => {
  const acciones = accionesDisponibles(config, cargar(config));
  // Toda acción que el prompt menciona existe (si no, el bot nunca podría usarla).
  const mencionadas = [...reglas.matchAll(/acci[oó]n\s+([a-z]+_[a-z_]+|ninguna|callarse)\b/g)].map((m) => m[1]);
  for (const a of mencionadas) assert.ok(acciones[a], `prompt.js habla de la acción "${a}" y no existe. Las que hay: ${Object.keys(acciones).join(", ")}`);
  // Toda acción prendida aparece en el prompt (si no, el bot no sabe cuándo usarla).
  for (const a of Object.keys(acciones)) {
    if (ACCIONES_DEL_NUCLEO[a]) continue;
    assert.ok(reglas.includes(a), `la acción "${a}" está prendida y prompt.js no dice cuándo usarla`);
  }
});

test("61. Lo que sabe no trae pendientes a la vista y cabe en el tope", () => {
  const texto = loQueSabe();
  assert.doesNotMatch(texto, /PENDIENTE|\[ \]|\[pendiente\]/i, "conocimiento.md tiene un pendiente a la vista: el bot lo leería. Bórralo o déjalo como nota <!-- -->");
  assert.ok(texto.length <= 30000, `conocimiento.md mide ${texto.length} caracteres; el tope sugerido es 30,000`);
});

test("62. si ya configuraste tu negocio, no queda nada del ejemplo de la clínica", () => {
  const claude = leer("../CLAUDE.md");
  const negocio = claude.slice(claude.indexOf("## El negocio"), claude.indexOf("## Dónde va cada cosa"));
  if (/\[pendiente\]/.test(negocio)) return; // todavía es la plantilla sin configurar
  for (const archivo of ["config.js", "prompt.js", "conocimiento.md"]) {
    const ruta = `../src/negocio/${archivo}`;
    if (!existsSync(new URL(ruta, import.meta.url))) continue;
    assert.doesNotMatch(leer(ruta), /Clínica Sonrisa|EJEMPLO/, `src/negocio/${archivo} todavía trae el ejemplo de la clínica`);
  }
});
