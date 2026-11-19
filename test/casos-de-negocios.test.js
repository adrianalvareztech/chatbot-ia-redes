// Casos que salieron al probar la plantilla con negocios distintos (café, joyería, agencia, contratista).
import assert from "node:assert/strict";
import { test } from "node:test";
import pedidos, { leerMenu } from "../src/modulos/pedidos.js";
import { accionesDisponibles } from "../src/nucleo/modulos.js";
import { revisar } from "../src/nucleo/revisor.js";
import { armarTurno, configPrueba, modulosPrueba, respuesta } from "./ayudas/falsos.js";

const CATALOGO = `# Tienda de prueba
| Producto | Precio | Tallas | Días | Disponible |
|---|---|---|---|---|
| Anillo Ola | $210 | 6, 7, 8 | | sí |
| Collar Sol | $380 | | | sí |
| Pan de elote | $48 | | viernes, sábado | sí |`;

const config = (pedidosExtra = {}) => {
  const c = configPrueba({ datos: ["nombre", "direccion"] });
  return { ...c, pedidos: { ...c.pedidos, ...pedidosExtra } };
};
const modulos = () => modulosPrueba({ conocimiento: { nombre: "conocimiento-prueba", leer: async () => CATALOGO }, agenda: null, pedidos });
const salida = (accion, articulos, entrega = "recoger", datos = { nombre: "Ana" }) => ({
  mensajes: ["Va"], accion, motivo: "prueba", datos: { nombre: null, direccion: null, ...datos },
  pedido: { articulos: articulos.map(([nombre, cantidad, nota = null]) => ({ nombre, cantidad, nota })), entrega },
});
const VIERNES = new Date("2026-11-20T18:00:00Z");
const LUNES = new Date("2026-11-16T18:00:00Z");
const ctx = (cambios = {}) => ({ config: config(), conv: { datos: {} }, conocimiento: CATALOGO, yaDijo: [], ahora: VIERNES, ...cambios });

test("pedidos: las columnas Tallas y Días se leen del catálogo", () => {
  const menu = leerMenu(CATALOGO);
  assert.equal(menu.find((a) => a.nombre === "Anillo Ola").opciones, "6, 7, 8");
  assert.equal(menu.find((a) => a.nombre === "Pan de elote").dias, "viernes, sábado");
  assert.equal(menu.find((a) => a.nombre === "Collar Sol").opciones, "");
});

test("pedidos: un artículo con tallas no se resume sin decir cuál", () => {
  assert.match(pedidos.revisar(salida("resumir_pedido", [["Anillo Ola", 1]]), ctx())[0], /falta saber cuál quiere \(6, 7, 8\)/);
  assert.deepEqual(pedidos.revisar(salida("resumir_pedido", [["Anillo Ola", 1, "talla 7"]]), ctx()), []);
  assert.deepEqual(pedidos.revisar(salida("resumir_pedido", [["Collar Sol", 1]]), ctx()), []);
});

test("pedidos: lo que solo hay ciertos días no se puede pedir otro día", () => {
  assert.deepEqual(pedidos.revisar(salida("resumir_pedido", [["Pan de elote", 1]]), ctx({ ahora: VIERNES })), []);
  assert.match(pedidos.revisar(salida("resumir_pedido", [["Pan de elote", 1]]), ctx({ ahora: LUNES }))[0], /solo hay estos días: viernes, sábado/);
});

test("pedidos: piezas_maximas frena el mayoreo aunque sean piezas distintas", () => {
  const mayoreo = salida("resumir_pedido", [["Collar Sol", 6], ["Anillo Ola", 6, "talla 7"]]);
  assert.deepEqual(pedidos.revisar(mayoreo, ctx()), [], "sin tope pasa");
  assert.match(pedidos.revisar(mayoreo, ctx({ config: config({ piezas_maximas: 11 }) }))[0], /12 piezas es un pedido grande.*pasar_al_dueno/);
});

test("pedidos: cada entrega puede decir cómo se paga, y un texto con PENDIENTE no le llega al cliente", async () => {
  const entregas = { recoger: { costo: 0, pide: ["nombre"], pago: "Pagas al recoger, en efectivo o con tarjeta." }, domicilio: { costo: 35, pide: ["nombre", "direccion"] } };
  const cerrar = async (pagoGeneral, entrega, datos) => {
    const t = await armarTurno({ config: config({ entregas, pago: { texto: pagoGeneral, link: "" } }), modulos: modulos() });
    const pedido = [["Collar Sol", 1]];
    await t.dice("un collar sol", salida("resumir_pedido", pedido, entrega, datos));
    await t.dice("sí", salida("cerrar_pedido", pedido, entrega, {}));
    return t.enviados();
  };
  assert.equal((await cerrar("Pagas por transferencia.", "recoger", { nombre: "Ana" })).at(-1), "Pagas al recoger, en efectivo o con tarjeta.");
  assert.equal((await cerrar("Pagas por transferencia.", "domicilio", { nombre: "Ana", direccion: "Calle 5" })).at(-1), "Pagas por transferencia.");
  const sinTexto = await cerrar("PENDIENTE: datos de la cuenta", "domicilio", { nombre: "Ana", direccion: "Calle 5" });
  assert.match(sinTexto.at(-1), /^Pedido confirmado:/);
  assert.ok(!sinTexto.some((m) => /PENDIENTE/.test(m)));
});

test('revisor: con precios = "nunca" tampoco sale un precio dicho con palabras', () => {
  const base = configPrueba();
  const nunca = { ...base, revisor: { ...base.revisor, precios: "nunca" } };
  const acciones = accionesDisponibles(nunca, modulosPrueba());
  const motivos = (m) => revisar(respuesta([m]), { acciones, config: nunca, conocimiento: "Limpieza: $800 MXN" }).motivos;
  for (const m of ["Anda entre 10 y 15 mil pesos", "Unos quince mil pesos", "Como 300 dólares", "Sale en 15 mil más o menos", "Cuesta $800 MXN"]) {
    assert.equal(motivos(m).length, 1, m);
  }
  for (const m of ["El precio lo vemos en la llamada", "Tenemos mil formas de ayudarte", "La visita para medir no tiene costo"]) {
    assert.deepEqual(motivos(m), [], m);
  }
});

test("agenda con link y avisar: el aviso trae lo que ya se sabía de la persona, no solo lo de este mensaje", async () => {
  const base = configPrueba({ datos: ["nombre", "negocio"] });
  const t = await armarTurno({ config: { ...base, agenda: { ...base.agenda, avisar: true } } });
  await t.dice("Tengo una constructora", { mensajes: ["Va, y qué quieres resolver?"], accion: "ninguna", motivo: "prueba", datos: { nombre: null, negocio: "constructora" } });
  await t.dice("Sí, agendemos", { mensajes: ["Aquí eliges tu horario"], accion: "mandar_link_cita", motivo: "prueba", datos: { nombre: null, negocio: null } });
  assert.match(t.aviso.avisos.at(-1), /- negocio: constructora/);
});
