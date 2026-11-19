// Interesados (avisar al dueño con los datos, sin callarse) y enlaces (mandar un link de "Lo que sabes").
import assert from "node:assert/strict";
import { test } from "node:test";
import enlaces, { enlacesDe } from "../src/modulos/enlaces.js";
import interesados from "../src/modulos/interesados.js";
import { armarTurno, configPrueba, modulosPrueba } from "./ayudas/falsos.js";

const SABE = `# Inmobiliaria de prueba
## Propiedades
- Nombre: Casa Roma | Precio: 4500000 | Zona: Roma | Link: https://inmo.com/casa-roma
- Nombre: Depa Centro | Precio: 2100000 | Zona: Centro | Link: https://inmo.com/depa-centro.
Guía para comprar: [descárgala aquí](https://inmo.com/guia)
Teléfono: 664 123 4567`;

const config = () => configPrueba({ datos: ["nombre", "telefono", "zona"], interesados: { campos: ["nombre", "telefono", "zona"] } });
const modulos = () => modulosPrueba({ conocimiento: { nombre: "conocimiento-prueba", leer: async () => SABE }, agenda: null, interesados, enlaces });
const salida = (mensajes, accion, datos = {}, enlace = null) => ({ mensajes, accion, motivo: "prueba", datos: { nombre: null, telefono: null, zona: null, ...datos }, enlace });
const turno = () => armarTurno({ config: config(), modulos: modulos() });

test("interesados: si falta un dato obligatorio se rechaza y el bot lo pregunta", async () => {
  const t = await turno();
  const r = await t.dice("Busco casa en la Roma, soy Luis",
    salida(["Listo, ya le pasé tus datos a un asesor"], "registrar_interesado", { nombre: "Luis", zona: "Roma" }),
    salida(["Va, Luis. A qué número te puede marcar el asesor?"], "ninguna", { nombre: "Luis", zona: "Roma" }));
  assert.equal(r, "contestó");
  assert.match(t.modelo.llamadas[1].usuario, /falta: telefono/);
  assert.equal(t.aviso.avisos.length, 0);
  assert.deepEqual((await t.mem.conversacion("conv-1")).datos, { nombre: "Luis", zona: "Roma" }, "lo que sí dijo se guarda");
});

test("interesados: con todos los datos avisa al dueño una vez, sin callar al bot", async () => {
  const t = await turno();
  await t.dice("Busco casa en la Roma, soy Luis", salida(["Va, Luis. A qué número te marca el asesor?"], "ninguna", { nombre: "Luis", zona: "Roma" }));
  const r = await t.dice("al 55 1234 5678", salida(["Listo, ya quedaste anotado. Un asesor te marca hoy"], "registrar_interesado", { telefono: "55 1234 5678" }));
  assert.equal(r, "contestó");
  assert.equal(t.aviso.avisos.length, 1);
  assert.match(t.aviso.avisos[0], /^Interesado nuevo: Ana @ana \(instagram\)\n- nombre: Luis\n- zona: Roma\n- telefono: 55 1234 5678\n/);
  const conv = await t.mem.conversacion("conv-1");
  assert.equal(conv.callado_hasta, null, "el bot sigue atendiendo");
  assert.equal(conv.datos.ficha_enviada, "nombre=Luis; telefono=55 1234 5678; zona=Roma");

  // La misma ficha no se manda dos veces.
  await t.dice("gracias", salida(["Listo"], "registrar_interesado"), salida(["A ti, Luis"], "ninguna"));
  assert.match(t.modelo.llamadas.at(-1).usuario, /ya se le mandaron al dueño/);
  assert.equal(t.aviso.avisos.length, 1);

  // Si cambia un dato, sí se vuelve a avisar.
  await t.dice("mejor busco en el Centro", salida(["Va, lo cambio"], "registrar_interesado", { zona: "Centro" }));
  assert.equal(t.aviso.avisos.length, 2);
  assert.match(t.aviso.avisos[1], /- zona: Centro/);
});

test("agenda con link y avisar = true: el dueño sabe a quién se le mandó el link, y el bot no se calla", async () => {
  const base = configPrueba({ datos: ["nombre", "negocio"] });
  const t = await armarTurno({ config: { ...base, agenda: { ...base.agenda, avisar: true } } });
  const r = await t.dice("Tengo una constructora, quiero agendar", { mensajes: ["Va, aquí eliges tu horario"], accion: "mandar_link_cita", motivo: "prueba", datos: { nombre: null, negocio: "constructora" } });
  assert.equal(r, "contestó");
  assert.equal(t.enviados().at(-1), "https://cal.com/clinica/cita?metadata[conversacion]=conv-1");
  assert.deepEqual(t.aviso.avisos, ["Le mandé el link para agendar a Ana @ana (instagram).\n- negocio: constructora"]);
  assert.equal((await t.mem.conversacion("conv-1")).callado_hasta, null);
});

test("enlaces: salen los links de Lo que sabes, sin el punto final ni el paréntesis", () => {
  assert.deepEqual([...enlacesDe(SABE, config())], ["https://inmo.com/casa-roma", "https://inmo.com/depa-centro", "https://inmo.com/guia"]);
  assert.ok(enlacesDe("", { revisor: { enlaces: ["https://maps.app.goo.gl/abc"] } }).has("https://maps.app.goo.gl/abc"));
});

test("enlaces: mandar_link manda un link de Lo que sabes como mensaje aparte", async () => {
  const t = await turno();
  const r = await t.dice("me pasas la casa de la Roma?", salida(["Claro, aquí la ves con fotos"], "mandar_link", {}, "https://inmo.com/casa-roma"));
  assert.equal(r, "contestó");
  assert.deepEqual(t.enviados(), ["Claro, aquí la ves con fotos", "https://inmo.com/casa-roma"]);
});

test("enlaces: un link inventado o recortado no sale", async () => {
  const ctx = { config: config(), conocimiento: SABE };
  assert.match(enlaces.revisar(salida(["Va"], "mandar_link", {}, "https://inmo.com/casa-condesa"), ctx)[0], /no está en "Lo que sabes"/);
  assert.match(enlaces.revisar(salida(["Va"], "mandar_link", {}, "https://inmo.com/casa"), ctx)[0], /no está en "Lo que sabes"/);
  assert.match(enlaces.revisar(salida(["Va"], "mandar_link", {}, null), ctx)[0], /falta copiar el link/);
  assert.deepEqual(enlaces.revisar(salida(["Va"], "mandar_link", {}, "https://inmo.com/guia"), ctx), []);

  const t = await turno();
  const mala = salida(["Aquí la ves"], "mandar_link", {}, "https://inmo.com/casa-condesa");
  assert.equal(await t.dice("tienes algo en la Condesa?", mala, structuredClone(mala)), "pasó al dueño");
  assert.ok(!t.enviados().some((m) => /casa-condesa/.test(m)));
});
