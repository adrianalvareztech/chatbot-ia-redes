// El módulo de pedidos: el bot dice qué quiere la persona; los precios y el total los pone el código.
import assert from "node:assert/strict";
import { test } from "node:test";
import pedidos, { abierto, dinero, leerMenu } from "../src/modulos/pedidos.js";
import { armarTurno, configPrueba, modulosPrueba } from "./ayudas/falsos.js";

const MENU = `# Café de prueba
Abrimos de lunes a sábado. Teléfono: 664 123 4567

## Bebidas
| Bebida | Precio |
|---|---|
| Latte chico | $50 |
| Latte grande | $60 |
| Chocolate | $1,200.50 |
| Café de olla | desde $30 |

## Pan
- Concha: $25
- Nombre: Pan de elote | Precio: 45 | Disponible: no

El envío a domicilio cuesta $35 dentro de la colonia.`;

const config = () => configPrueba({ datos: ["nombre", "direccion"] });
const modulos = (conocimiento = MENU) => modulosPrueba({ conocimiento: { nombre: "conocimiento-prueba", leer: async () => conocimiento }, agenda: null, pedidos });
const salida = (mensajes, accion, articulos, entrega = "recoger", datos = {}) => ({
  mensajes, accion, motivo: "prueba", datos: { nombre: null, direccion: null, ...datos },
  pedido: articulos ? { articulos: articulos.map(([nombre, cantidad, nota = null]) => ({ nombre, cantidad, nota })), entrega } : null,
});
const turno = (cambios = {}) => armarTurno({ config: config(), modulos: modulos(), ...cambios });

test("pedidos: el menú sale de tablas, filas de Notion y líneas con precio al final", () => {
  const menu = leerMenu(MENU);
  assert.deepEqual(menu.map((a) => a.nombre), ["Latte chico", "Latte grande", "Chocolate", "Concha", "Pan de elote"]);
  assert.equal(menu.find((a) => a.nombre === "Chocolate").precio, 1200.5);
  assert.equal(menu.find((a) => a.nombre === "Pan de elote").disponible, false);
  assert.ok(!menu.some((a) => /olla|env[ií]o/i.test(a.nombre)), '"desde $30" y una frase suelta no son artículos');
});

test("pedidos: dinero y horario", () => {
  assert.equal(dinero(1250, "MXN"), "$1,250 MXN");
  assert.equal(dinero(45.5), "$45.50");
  const horario = { lunes: "08:00-20:00", viernes: "18:00-02:00" };
  const zona = "America/Mexico_City";
  assert.equal(abierto(null, new Date(), zona), true);
  assert.equal(abierto(horario, new Date("2026-11-16T16:00:00Z"), zona), true, "lunes 10:00");
  assert.equal(abierto(horario, new Date("2026-11-17T03:00:00Z"), zona), false, "lunes 21:00");
  assert.equal(abierto(horario, new Date("2026-11-21T07:30:00Z"), zona), true, "sábado 1:30, sigue el turno del viernes");
  assert.equal(abierto(horario, new Date("2026-11-22T16:00:00Z"), zona), false, "domingo no abre");
});

test("pedidos: resumir_pedido suma con los precios del menú y el total lo escribe el sistema", async () => {
  const t = await turno();
  const r = await t.dice("2 lattes grandes y una concha, a domicilio en Calle 5 #10, soy Ana",
    salida(["Va, te paso el resumen"], "resumir_pedido", [["latte grande", 2, "sin azúcar"], ["Concha", 1]], "domicilio", { nombre: "Ana", direccion: "Calle 5 #10" }));
  assert.equal(r, "contestó");
  const [suyo, resumen] = t.enviados();
  assert.equal(suyo, "Va, te paso el resumen");
  assert.match(resumen, /^Tu pedido:\n1 x Concha: \$25\n2 x Latte grande: \$120\nEntrega \(domicilio\): \$35\nTotal: \$180 MXN\n/);
  assert.match(resumen, /Notas: Latte grande: sin azúcar/);
  assert.match(resumen, /direccion: Calle 5 #10/);
  assert.match(resumen, /Lo confirmas\?$/);
  assert.equal(t.aviso.avisos.length, 0, "resumir no le avisa a nadie");
});

test("pedidos: algo que no está en el menú se rechaza y el bot corrige", async () => {
  const t = await turno();
  const r = await t.dice("un latte grande y un cruasán",
    salida(["Va"], "resumir_pedido", [["Latte grande", 1], ["Cruasán", 1]], "recoger", { nombre: "Ana" }),
    salida(["Cruasán no manejamos. Te dejo solo el latte grande?"], "ninguna", null));
  assert.equal(r, "contestó");
  assert.match(t.modelo.llamadas[1].usuario, /"Cruasán" no está en el menú/);
  assert.deepEqual(t.enviados(), ["Cruasán no manejamos. Te dejo solo el latte grande?"]);
});

test("pedidos: si insiste en algo que no está en el menú, pasa al dueño y no hay pedido", async () => {
  const t = await turno();
  const mala = salida(["Va"], "resumir_pedido", [["Cruasán", 1]], "recoger", { nombre: "Ana" });
  assert.equal(await t.dice("un cruasán", mala, structuredClone(mala)), "pasó al dueño");
  assert.ok(t.config.dueno.frases_pase.includes(t.enviados()[0]));
  assert.ok(!t.aviso.avisos.some((a) => /Pedido nuevo/.test(a)));
  assert.match(t.aviso.avisos.at(-1), /Cruasán/);
});

test("pedidos: un nombre que puede ser dos cosas, lo no disponible y los datos que faltan se rechazan", () => {
  const ctx = { config: config(), conv: { datos: {} }, conocimiento: MENU, yaDijo: [] };
  const motivo = (s) => pedidos.revisar(s, ctx).join(" | ");
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["latte", 1]], "recoger", { nombre: "Ana" })), /puede ser: Latte chico, Latte grande/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["pan de elote", 1]], "recoger", { nombre: "Ana" })), /no está disponible/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["concha", 1]], "domicilio", { nombre: "Ana" })), /falta: direccion/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["concha", 1]], "dron", { nombre: "Ana" })), /"entrega" tiene que ser una de: recoger, domicilio/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["concha", 50]], "recoger", { nombre: "Ana" })), /pedido grande/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", [["concha", 0]], "recoger", { nombre: "Ana" })), /1 o más/);
  assert.match(motivo(salida(["Va"], "resumir_pedido", null)), /falta llenar "pedido"/);
  assert.deepEqual(pedidos.revisar(salida(["Hola"], "ninguna", null), ctx), [], "otras acciones no se revisan aquí");
  // El nombre que ya se sabía de antes cuenta.
  assert.deepEqual(pedidos.revisar(salida(["Va"], "resumir_pedido", [["concha", 1]]), { ...ctx, conv: { datos: { nombre: "Ana" } } }), []);
});

test("pedidos: fuera de horario y arriba del tope no se toma el pedido", () => {
  const buena = salida(["Va"], "resumir_pedido", [["concha", 2]], "recoger", { nombre: "Ana" });
  const cerrado = { ...config(), pedidos: { ...config().pedidos, horario: { lunes: "08:00-20:00" } } };
  const ctx = { conv: { datos: {} }, conocimiento: MENU, yaDijo: [] };
  assert.match(pedidos.revisar(buena, { ...ctx, config: cerrado, ahora: new Date("2026-11-22T16:00:00Z") })[0], /fuera del horario/);
  assert.deepEqual(pedidos.revisar(buena, { ...ctx, config: cerrado, ahora: new Date("2026-11-16T16:00:00Z") }), []);
  const tope = { ...config(), pedidos: { ...config().pedidos, total_maximo: 40 } };
  assert.match(pedidos.revisar(buena, { ...ctx, config: tope })[0], /pasa del tope.*pasar_al_dueno/);
});

test("pedidos: cerrar_pedido sin que la persona haya visto el total se rechaza", async () => {
  const t = await turno();
  const cerrar = salida(["Listo, ya quedó"], "cerrar_pedido", [["Concha", 2]], "recoger", { nombre: "Ana" });
  await t.dice("2 conchas para recoger, soy Ana, ya ciérralo", cerrar, salida(["Va, te paso el resumen"], "resumir_pedido", [["Concha", 2]], "recoger", { nombre: "Ana" }));
  assert.match(t.modelo.llamadas[1].usuario, /usa resumir_pedido primero/);
  assert.match(t.enviados().at(-1), /^Tu pedido:/);
  assert.equal(t.aviso.avisos.length, 0);
});

test("pedidos: resumen, confirmación y cierre: aviso al dueño, cómo se paga, y el bot no se calla", async () => {
  const t = await turno();
  const pedido = [["Concha", 2], ["Latte chico", 1]];
  await t.dice("2 conchas y un latte chico para recoger, soy Ana", salida(["Va, te paso el resumen"], "resumir_pedido", pedido, "recoger", { nombre: "Ana" }));
  const r = await t.dice("sí, confirmo", salida(["Listo, ya quedó"], "cerrar_pedido", pedido));
  assert.equal(r, "contestó");
  assert.deepEqual(t.enviados().slice(-3), ["Listo, ya quedó", "Pedido confirmado:\n2 x Concha: $50\n1 x Latte chico: $50\nEntrega: recoger\nTotal: $100 MXN", "Pagas al recibir."]);
  assert.equal(t.aviso.avisos.length, 1);
  assert.match(t.aviso.avisos[0], /^Pedido nuevo de Ana @ana \(instagram\)\n2 x Concha: \$50[\s\S]*Total: \$100 MXN\nnombre: Ana$/);
  const conv = await t.mem.conversacion("conv-1");
  assert.equal(conv.callado_hasta, null, "un pedido cerrado no calla al bot");
  assert.equal(conv.datos.ultimo_pedido, "2 x Concha, 1 x Latte chico · recoger · $100 MXN");

  // El mismo pedido no se cierra dos veces.
  await t.dice("gracias!", salida(["Listo"], "cerrar_pedido", pedido), salida(["A ti, aquí te esperamos"], "ninguna", null));
  assert.match(t.modelo.llamadas.at(-1).usuario, /este pedido ya se cerró/);
  assert.equal(t.aviso.avisos.length, 1, "no hubo segundo aviso");
});

test("pedidos: si cambia el pedido después del resumen, hay que resumir otra vez", async () => {
  const t = await turno();
  await t.dice("una concha, soy Ana", salida(["Va"], "resumir_pedido", [["Concha", 1]], "recoger", { nombre: "Ana" }));
  await t.dice("mejor que sean 3, sí confirmo",
    salida(["Listo"], "cerrar_pedido", [["Concha", 3]]),
    salida(["Va, lo cambio"], "resumir_pedido", [["Concha", 3]]));
  assert.match(t.modelo.llamadas[2].usuario, /usa resumir_pedido primero/);
  assert.match(t.enviados().at(-1), /3 x Concha: \$75\nEntrega: recoger\nTotal: \$75 MXN/);
  assert.equal(t.aviso.avisos.length, 0);
});

test("pedidos: el bot no puede escribir un total sumado por su cuenta", async () => {
  const t = await turno();
  const r = await t.dice("cuánto sería por 2 lattes grandes y una concha?",
    salida(["Serían $145 en total"], "ninguna", null),
    salida(["Te paso el resumen con el total"], "resumir_pedido", [["Latte grande", 2], ["Concha", 1]], "recoger", { nombre: "Ana" }));
  assert.equal(r, "contestó");
  assert.match(t.modelo.llamadas[1].usuario, /precio que no está en "Lo que sabes" \(\$145\)/);
  assert.match(t.enviados().at(-1), /Total: \$145 MXN/);
});

test("pedidos: cambias un precio en Lo que sabe y el total cambia", async () => {
  const t = await armarTurno({ config: config(), modulos: modulos(MENU.replace("- Concha: $25", "- Concha: $28")) });
  await t.dice("2 conchas, soy Ana", salida(["Va"], "resumir_pedido", [["Concha", 2]], "recoger", { nombre: "Ana" }));
  assert.match(t.enviados().at(-1), /2 x Concha: \$56\nEntrega: recoger\nTotal: \$56 MXN/);
});

test("pedidos: el costo de entrega sale de config; en el simulador nada sale por Zernio y el aviso sí llega", async () => {
  const ctx = await pedidos.contexto({}, config());
  assert.match(ctx, /- domicilio: cuesta \$35 MXN; antes de resumir pide: nombre, direccion/);
  const t = await turno({ modo: "simulador" });
  const pedido = [["Concha", 1]];
  await t.dice("una concha, soy Ana", salida(["Va"], "resumir_pedido", pedido, "recoger", { nombre: "Ana" }));
  await t.dice("sí", salida(["Listo"], "cerrar_pedido", pedido));
  assert.equal(t.zernio.envios.length, 0);
  assert.match(t.aviso.avisos[0], /^Pedido nuevo/);
});

test("pedidos: en solo-avisos el aviso del pedido se marca como prueba", async () => {
  // En solo-avisos lo que el bot "diría" no llega a la persona, así que el resumen lo manda el dueño a mano.
  const t = await turno({ modo: "solo-avisos" });
  await t.mem.recibir({ tipo: "entrante", conversacion: "conv-1", cuenta: "cuenta-1", canal: "instagram", persona: "p-1", nombre: "Ana", usuario: "ana", texto: "una concha, soy Ana", fecha: new Date().toISOString() });
  await t.mem.anotar("conv-1", "bot", "Tu pedido:\n1 x Concha: $25\nEntrega: recoger\nTotal: $25 MXN\nLo confirmas?", "enviado");
  await t.dice("sí", salida(["Listo"], "cerrar_pedido", [["Concha", 1]], "recoger", { nombre: "Ana" }));
  assert.ok(t.aviso.avisos.some((a) => /^\[solo avisos\] Pedido nuevo/.test(a)));
});
