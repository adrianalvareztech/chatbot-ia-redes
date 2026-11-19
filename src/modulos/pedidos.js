// Tomar pedidos dentro del chat: un café, una taquería, una pastelería o una tienda que vende por mensaje.
// El bot solo dice QUÉ quiere la persona. Los precios, la suma y el total los pone este archivo,
// leyendo el menú de "Lo que sabes" (conocimiento.md o Notion). Así el total nunca es inventado.
//
// Dos pasos, siempre en este orden:
//   resumir_pedido  el sistema escribe el resumen con el total y pregunta si lo confirma
//   cerrar_pedido   la persona ya confirmó ese resumen: se le avisa al dueño (o a cocina)
//
// Qué cuenta como "algo que se puede pedir" en "Lo que sabes":
//   - una fila de una tabla que tenga una columna Precio:   | Latte grande | $60 |
//   - una fila de una base de Notion con Precio:            - Nombre: Latte grande | Precio: 60
//   - una línea con dos puntos y el precio al final:        - Latte grande: $60
// Un precio con "desde" o "aprox" no es fijo y no se puede pedir. "Disponible: no" tampoco.
// Columnas opcionales de la tabla (o de la base de Notion):
//   Disponible   "no" = hoy no hay
//   Días         "viernes, sábado" = solo se puede pedir esos días
//   Opciones     (o Tallas, Sabores, Colores) "6, 7, 8" = el bot tiene que preguntar cuál y ponerlo en la nota
// Para ver la lista tal como la leyó el sistema: npm run prompt

const RESUMEN = "Tu pedido:";
const CIERRE = "Pedido confirmado:";
const NUM = String.raw`\d{1,3}(?:[ ,.]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
const PRECIO_AL_FINAL = new RegExp(String.raw`^(.+?):\s*\$\s?(${NUM})(?:\s*(?:mxn|usd|pesos|d[oó]lares|cop|ars|clp|pen|eur))?\.?$`, "i");
const NO_ES_FIJO = /desde|a partir|aprox|cotiza|var[ií]a|seg[uú]n/i;
const COL_PRECIO = /precio|costo/i;
const COL_NOMBRE = /nombre|producto|art[ií]culo|platillo|bebida|servicio|concepto|modelo/i;
const COL_DISPONIBLE = /disponible|existencia|stock|\bhay\b/i;
const COL_DIAS = /^d[ií]as/i;
const COL_OPCIONES = /opciones|tallas?|sabor(es)?|color(es)?|medidas?/i;
const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

// Quita acentos, mayúsculas, signos y espacios de más para comparar nombres.
const limpio = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();
const sinFormato = (t) => String(t || "").replace(/\*\*|__|`/g, "").trim();

function numero(texto) {
  const m = String(texto).match(new RegExp(NUM));
  if (!m) return null;
  const n = Number.parseFloat(m[0].replace(/[ ,.](?=\d{3}(?!\d))/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const noHay = (v) => /^(no|false|0|agotado)$/i.test(String(v || "").trim());

// "Lo que sabes" → lo que se puede pedir: [{ nombre, precio, disponible }].
export function leerMenu(conocimiento) {
  const menu = new Map();
  const poner = (nombre, precioTexto, disponible = true, dias = "", opciones = "") => {
    const n = sinFormato(nombre);
    if (!n || NO_ES_FIJO.test(precioTexto)) return;
    const precio = numero(precioTexto);
    if (precio === null) return;
    menu.set(limpio(n), { nombre: n, precio, disponible, dias: sinFormato(dias), opciones: sinFormato(opciones) });
  };
  const col = (celdas, patron) => celdas.findIndex((c) => patron.test(c));

  let tabla = null; // columnas de la tabla que se está leyendo
  for (const cruda of String(conocimiento || "").split(/\r?\n/)) {
    const linea = cruda.trim();

    // Tabla: | Latte grande | $60 | ... |
    if (linea.startsWith("|")) {
      const celdas = linea.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (celdas.every((c) => /^[-: ]*$/.test(c))) continue; // el renglón |---|---|
      if (!tabla) {
        const nombre = col(celdas, COL_NOMBRE);
        tabla = { precio: col(celdas, COL_PRECIO), nombre: nombre > -1 ? nombre : 0, disponible: col(celdas, COL_DISPONIBLE), dias: col(celdas, COL_DIAS), opciones: col(celdas, COL_OPCIONES) };
        continue;
      }
      if (tabla.precio > -1) poner(celdas[tabla.nombre], celdas[tabla.precio] || "", !noHay(celdas[tabla.disponible] ?? "sí"), celdas[tabla.dias], celdas[tabla.opciones]);
      continue;
    }
    tabla = null;

    const texto = linea.replace(/^[-*]\s+/, "");
    // Fila de una base de Notion: - Nombre: Latte | Precio: 60 | Disponible: sí
    if (texto.includes(" | ")) {
      const pares = texto.split(" | ").map((p) => { const i = p.indexOf(":"); return i > -1 ? [p.slice(0, i).trim(), p.slice(i + 1).trim()] : null; }).filter(Boolean);
      const precio = pares.find(([k]) => COL_PRECIO.test(k));
      if (!precio) continue;
      const nombre = pares.find(([k]) => COL_NOMBRE.test(k)) || pares.find(([k]) => !COL_PRECIO.test(k));
      const disponible = pares.find(([k]) => COL_DISPONIBLE.test(k));
      const dias = pares.find(([k]) => COL_DIAS.test(k));
      const opciones = pares.find(([k]) => COL_OPCIONES.test(k) && !COL_NOMBRE.test(k));
      if (nombre) poner(nombre[1], precio[1], !noHay(disponible?.[1] ?? "sí"), dias?.[1], opciones?.[1]);
      continue;
    }
    // Línea suelta: - Latte grande: $60
    const m = PRECIO_AL_FINAL.exec(sinFormato(texto));
    if (m && !NO_ES_FIJO.test(m[1])) poner(m[1], m[2]);
  }
  return [...menu.values()];
}

// Busca un artículo por nombre. Devuelve { articulo } o { motivo } con lo que hay que corregir.
function buscar(menu, nombre, hoy) {
  const q = limpio(nombre);
  if (!q) return { motivo: "un artículo del pedido viene sin nombre" };
  let candidatos = menu.filter((a) => limpio(a.nombre) === q);
  if (!candidatos.length) candidatos = menu.filter((a) => limpio(a.nombre).includes(q) || q.includes(limpio(a.nombre)));
  if (!candidatos.length) return { motivo: `"${nombre}" no está en el menú de "Lo que sabes". No lo ofrezcas ni lo cobres: dile que no lo manejan` };
  if (candidatos.length > 1) return { motivo: `"${nombre}" puede ser: ${candidatos.map((c) => c.nombre).join(", ")}. Pregúntale cuál con la acción ninguna` };
  if (!candidatos[0].disponible) return { motivo: `"${candidatos[0].nombre}" no está disponible hoy. Díselo y ofrece otra cosa con la acción ninguna` };
  if (candidatos[0].dias && hoy && !limpio(candidatos[0].dias).split(" ").includes(hoy)) {
    return { motivo: `"${candidatos[0].nombre}" solo hay estos días: ${candidatos[0].dias}. Hoy no se puede pedir: díselo con la acción ninguna` };
  }
  return { articulo: candidatos[0] };
}

export function dinero(n, moneda) {
  const [entero, decimales] = (Number.isInteger(n) ? String(n) : n.toFixed(2)).split(".");
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${miles}${decimales ? `.${decimales}` : ""}${moneda ? ` ${moneda}` : ""}`;
}

// El día de hoy en la zona del negocio, sin acento: "miercoles".
function diaDeHoy(ahora, zona) {
  const corto = new Intl.DateTimeFormat("en-US", { timeZone: zona, weekday: "short" }).format(ahora);
  return DIAS[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(corto)];
}

// ¿Está abierto para pedidos? horario = null → siempre. Si no: { lunes: "08:00-20:00", sabado: "09:00-14:00, 17:00-21:00" }.
export function abierto(horario, ahora, zona) {
  if (!horario) return true;
  const partes = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: zona, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
    .formatToParts(ahora).map((p) => [p.type, p.value]));
  const hoy = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes.weekday);
  const minuto = Number(partes.hour) * 60 + Number(partes.minute);
  const tramos = (dia) => {
    const llave = Object.keys(horario).find((k) => limpio(k) === DIAS[dia]);
    return String((llave && horario[llave]) || "").split(",").map((t) => t.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/)).filter(Boolean)
      .map((m) => [Number(m[1]) * 60 + Number(m[2]), Number(m[3]) * 60 + Number(m[4])]);
  };
  // Un tramo que cierra después de medianoche (18:00-02:00) sigue abierto la madrugada siguiente.
  if (tramos(hoy).some(([abre, cierra]) => (cierra > abre ? minuto >= abre && minuto < cierra : minuto >= abre))) return true;
  return tramos((hoy + 6) % 7).some(([abre, cierra]) => cierra <= abre && minuto < cierra);
}

// Arma el pedido contra el menú. Devuelve { motivos } si algo no cuadra, o las cuentas hechas.
export function calcular(salida, { config, conv, conocimiento, ahora }) {
  const opciones = config.pedidos || {};
  const pedido = salida.pedido;
  if (!pedido || !Array.isArray(pedido.articulos) || !pedido.articulos.length) {
    return { motivos: ['falta llenar "pedido" con lo que quiere la persona'] };
  }
  const menu = leerMenu(conocimiento);
  if (!menu.length) return { motivos: ['no encuentro artículos con precio en "Lo que sabes": usa pasar_al_dueno'] };

  const motivos = [];
  const juntos = new Map();
  const hoy = diaDeHoy(ahora || new Date(), config.zona_horaria);
  for (const a of pedido.articulos) {
    const r = buscar(menu, a.nombre, hoy);
    if (r.motivo) { motivos.push(r.motivo); continue; }
    if (r.articulo.opciones && !String(a.nota || "").trim()) {
      motivos.push(`de "${r.articulo.nombre}" falta saber cuál quiere (${r.articulo.opciones}). Pregúntale con la acción ninguna y ponlo en "nota"`);
      continue;
    }
    const cantidad = Number(a.cantidad);
    const tope = opciones.cantidad_maxima || 20;
    if (!Number.isInteger(cantidad) || cantidad < 1) { motivos.push(`la cantidad de "${r.articulo.nombre}" tiene que ser 1 o más`); continue; }
    if (cantidad > tope) { motivos.push(`${cantidad} de "${r.articulo.nombre}" es un pedido grande: usa pasar_al_dueno`); continue; }
    const previo = juntos.get(r.articulo.nombre) || { ...r.articulo, cantidad: 0, notas: [] };
    previo.cantidad += cantidad;
    if (a.nota) previo.notas.push(String(a.nota).trim());
    juntos.set(r.articulo.nombre, previo);
  }

  const entregas = opciones.entregas || {};
  const llave = Object.keys(entregas).find((k) => limpio(k) === limpio(pedido.entrega));
  if (!llave) motivos.push(`"entrega" tiene que ser una de: ${Object.keys(entregas).join(", ")}. Si no te lo ha dicho, pregúntale con la acción ninguna`);
  const entrega = llave ? { nombre: llave, costo: Number(entregas[llave].costo) || 0, pide: entregas[llave].pide || [], pago: entregas[llave].pago } : null;
  const piezas = [...juntos.values()].reduce((s, a) => s + a.cantidad, 0);
  if (opciones.piezas_maximas && piezas > opciones.piezas_maximas) motivos.push(`${piezas} piezas es un pedido grande: usa pasar_al_dueno`);

  // Los datos que pide esa forma de entrega (nombre, dirección...). Cuentan los de mensajes anteriores.
  const nuevos = Object.fromEntries(Object.entries(salida.datos || {}).filter(([, v]) => v !== null && v !== ""));
  const datos = { ...(conv?.datos || {}), ...nuevos };
  const faltan = (entrega?.pide || []).filter((d) => !String(datos[d] || "").trim());
  if (faltan.length) motivos.push(`para "${entrega.nombre}" falta: ${faltan.join(", ")}. Pídelo (una cosa por mensaje) con la acción ninguna`);

  if (motivos.length) return { motivos };

  const articulos = [...juntos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const total = articulos.reduce((s, a) => s + a.precio * a.cantidad, 0) + entrega.costo;
  if (opciones.total_maximo && total > opciones.total_maximo) {
    return { motivos: [`el pedido suma ${dinero(total, opciones.moneda)} y pasa del tope para cerrar por chat: usa pasar_al_dueno`] };
  }
  const renglones = [
    ...articulos.map((a) => `${a.cantidad} x ${a.nombre}: ${dinero(a.precio * a.cantidad)}`),
    entrega.costo ? `Entrega (${entrega.nombre}): ${dinero(entrega.costo)}` : `Entrega: ${entrega.nombre}`,
    `Total: ${dinero(total, opciones.moneda)}`,
  ];
  return { motivos: [], articulos, entrega, total, datos, bloque: renglones.join("\n") };
}

// El último mensaje del bot que empieza con esa cabecera y trae exactamente este pedido.
const ultimo = (yaDijo, cabeza, bloque) => (yaDijo || []).findLastIndex((m) => String(m).startsWith(`${cabeza}\n${bloque}`));

const pedidoONulo = {
  anyOf: [
    { type: "null" },
    {
      type: "object",
      properties: {
        articulos: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nombre: { type: "string" },
              cantidad: { type: "integer" },
              nota: { anyOf: [{ type: "string" }, { type: "null" }] },
            },
            required: ["nombre", "cantidad", "nota"],
            additionalProperties: false,
          },
        },
        entrega: { type: "string" },
      },
      required: ["articulos", "entrega"],
      additionalProperties: false,
    },
  ],
};

export default {
  nombre: "pedidos",
  secretos: [],
  acciones: {
    resumir_pedido: { descripcion: 'Ya te dijo todo lo que quiere y cómo lo recibe. Llena "pedido" con los nombres del menú. El sistema escribe el resumen con el total y le pregunta si lo confirma: tú no sumas ni escribes el total.' },
    cerrar_pedido: { descripcion: 'La persona ya dijo que sí al resumen que mandó el sistema. Llena "pedido" igual que en ese resumen. El sistema le avisa al negocio y manda cómo se paga.' },
  },
  campos: { pedido: pedidoONulo },

  // Le dice al bot cómo se entrega y cuánto cuesta. Sale de config.js, no de "Lo que sabes".
  async contexto(env, config) {
    const opciones = config.pedidos || {};
    const entregas = Object.entries(opciones.entregas || {}).map(([nombre, e]) =>
      `- ${nombre}: ${Number(e.costo) ? `cuesta ${dinero(Number(e.costo), opciones.moneda)}` : "sin costo"}${e.pide?.length ? `; antes de resumir pide: ${e.pide.join(", ")}` : ""}`);
    const cerrado = abierto(opciones.horario, new Date(), config.zona_horaria) ? [] : ["Ahorita está fuera del horario de pedidos: no tomes pedidos."];
    return ["PEDIDOS", 'Formas de entrega (usa el nombre tal cual en "entrega"):', ...entregas, ...cerrado].join("\n");
  },

  // Lo llama el revisor antes de dejar salir la respuesta. Devuelve los motivos de rechazo.
  revisar(salida, { config, conv, conocimiento, yaDijo, ahora }) {
    if (!this.acciones[salida.accion]) return [];
    const opciones = config.pedidos || {};
    if (!abierto(opciones.horario, ahora || new Date(), config.zona_horaria)) {
      return ['ahorita no se toman pedidos (fuera del horario de pedidos). Dile el horario que está en "Lo que sabes" con la acción ninguna'];
    }
    const c = calcular(salida, { config, conv, conocimiento, ahora });
    if (c.motivos.length) return c.motivos;
    if (salida.accion === "cerrar_pedido") {
      const resumen = ultimo(yaDijo, RESUMEN, c.bloque);
      if (resumen < 0) return ["la persona todavía no ve el total de este pedido: usa resumir_pedido primero"];
      if (ultimo(yaDijo, CIERRE, c.bloque) > resumen) return ["este pedido ya se cerró. Si quiere otro, usa resumir_pedido; si no, contesta con la acción ninguna"];
    }
    return [];
  },

  async ejecutar(accion, salida, { config, conv, conocimiento, ahora }) {
    const opciones = config.pedidos || {};
    const c = calcular(salida, { config, conv, conocimiento, ahora });
    if (c.motivos.length) return { fallo: c.motivos.join("; ") };
    const notas = c.articulos.filter((a) => a.notas.length).map((a) => `${a.nombre}: ${a.notas.join(", ")}`);
    const datos = c.entrega.pide.map((d) => `${d}: ${c.datos[d]}`);

    if (accion === "resumir_pedido") {
      const detalle = [...(notas.length ? [`Notas: ${notas.join("; ")}`] : []), ...datos];
      return { mensajes: [[`${RESUMEN}\n${c.bloque}`, ...detalle, "Lo confirmas?"].join("\n")] };
    }

    const quien = [conv.nombre, conv.usuario && `@${conv.usuario}`].filter(Boolean).join(" ") || `la conversación ${conv.id}`;
    const aviso = [`Pedido nuevo de ${quien} (${conv.canal})`, c.bloque, ...(notas.length ? [`Notas: ${notas.join("; ")}`] : []), ...datos].join("\n");
    const corto = `${c.articulos.map((a) => `${a.cantidad} x ${a.nombre}`).join(", ")} · ${c.entrega.nombre} · ${dinero(c.total, opciones.moneda)}`;
    return {
      // Cómo se paga: lo de esa forma de entrega si lo tiene; si no, el general. Un texto a medias no sale.
      mensajes: [`${CIERRE}\n${c.bloque}`, c.entrega.pago || opciones.pago?.texto].filter((m) => m && !/PENDIENTE/.test(m)),
      link: opciones.pago?.link || undefined,
      aviso,
      datos: { ultimo_pedido: corto },
    };
  },
};
