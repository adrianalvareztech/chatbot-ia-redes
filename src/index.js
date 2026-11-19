// La puerta del bot. Tres rutas y un reloj:
//   POST /webhooks/zernio   aquí llegan los mensajes de Zernio
//   GET  /salud             dice si está prendido y qué llaves faltan (sin enseñar ninguna)
//   GET  /simulador/hilo    solo con MODO=simulador: lo que contestó el bot, para el chat de prueba
//   cron cada 10 min        copia de Notion, limpieza y conteo de mensajes del mes
//
// MODO (en wrangler.toml): "apagado" no hace nada, "solo-avisos" no manda y le avisa al dueño
// qué contestaría, "encendido" manda de verdad. "simulador" solo existe en tu compu (.dev.vars).
import config from "./negocio/config.js";
import { esDeMiCuenta, normalizar } from "./nucleo/eventos.js";
import { firmaValida } from "./nucleo/firma.js";
import { memoria } from "./nucleo/memoria.js";
import { cargar, prendidos, secretosQueFaltan } from "./nucleo/modulos.js";

export { Conversacion } from "./nucleo/conversacion.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/webhooks/zernio") return recibirWebhook(request, env);
    if (request.method === "GET" && url.pathname === "/salud") {
      const modulos = cargar(config);
      return Response.json({ ok: true, modo: env.MODO, modulos: config.modulos, faltan: secretosQueFaltan(env, modulos) });
    }
    if (env.MODO === "simulador" && request.method === "GET" && url.pathname === "/simulador/hilo") {
      const id = url.searchParams.get("conversacion");
      const mem = memoria(env.DB);
      return Response.json({ conversacion: await mem.conversacion(id), mensajes: await mem.hilo(id, 50, true) });
    }
    return new Response("no existe", { status: 404 });
  },

  async scheduled(controller, env, ctx) {
    if (env.MODO === "apagado") return;
    ctx.waitUntil(programado(env));
  },
};

async function recibirWebhook(request, env) {
  const cuerpo = await request.text();
  if (!(await firmaValida(cuerpo, request.headers.get("x-zernio-signature"), env.ZERNIO_WEBHOOK_SECRET))) {
    return new Response("firma inválida", { status: 401 });
  }
  if (env.MODO === "apagado") return new Response("apagado");

  let evento;
  try { evento = JSON.parse(cuerpo); } catch { return new Response("no es JSON", { status: 400 }); }
  const m = normalizar(evento);
  if (m.tipo === "ignorar") return new Response(`ignorado: ${m.motivo}`);
  if (!esDeMiCuenta(m, config.zernio.cuentas)) return new Response("ignorado: otra cuenta");

  // Zernio entrega al menos una vez: el mismo evento no se atiende dos veces.
  const mem = memoria(env.DB);
  const id = request.headers.get("x-zernio-event-id") || evento.id;
  if (id && !(await mem.eventoNuevo(id))) return new Response("repetido");

  // Se le entrega a la conversación antes del 200. Si falla, Zernio reintenta.
  try {
    const conversacion = env.CONVERSACION.get(env.CONVERSACION.idFromName(m.conversacion));
    const r = m.tipo === "entrante" ? await conversacion.entrante(m) : await conversacion.saliente(m);
    return new Response(r);
  } catch (e) {
    console.error("no se pudo entregar el evento:", e.stack || e.message);
    if (id) await mem.olvidarEvento(id);
    return new Response("error", { status: 500 });
  }
}

async function programado(env) {
  const mem = memoria(env.DB);
  const modulos = cargar(config);
  const avisar = (texto) => (modulos.aviso ? modulos.aviso.avisar(env, config, texto) : console.log("[aviso]", texto));

  for (const m of prendidos(modulos)) {
    if (!m.programado) continue;
    try {
      const r = await m.programado(env, config, mem);
      if (r?.aviso) await avisar(r.aviso);
    } catch (e) {
      console.error(`módulo ${m.nombre}:`, e.message);
    }
  }
  await mem.purgar(7);

  // Zernio corta en 10,000 mensajes al mes sin tarjeta. Se avisa una vez al cruzar 7,500 y 9,500.
  const enviados = await mem.enviadosDelMes();
  const mes = new Date().toISOString().slice(0, 7);
  for (const tope of [9500, 7500]) {
    if (enviados < tope) continue;
    const clave = `aviso-mensajes-${mes}-${tope}`;
    if (!(await mem.conocimiento(clave))) {
      await avisar(`El bot ya mandó ${enviados} mensajes este mes. Zernio corta en 10,000 si no tienes tarjeta.`);
      await mem.guardarConocimiento(clave, String(enviados));
    }
    break;
  }
}
