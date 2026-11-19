// Un turno completo: leer la plática, pedir la respuesta, revisarla y mandarla.
// Todo lo de afuera (modelo, Zernio, aviso, reloj) llega como parámetro, así se prueba sin red.
import { leerAdjunto } from "./eventos.js";
import { ErrorModelo } from "./modelo.js";
import { accionesDisponibles, camposExtra, duenoDeAccion, prendidos } from "./modulos.js";
import { contexto, esquema, pedido, sistema } from "./prompt.js";
import { recortar, revisar } from "./revisor.js";
import { dentroDeVentana, esRegreso, estaCallado, hastaCuando, quienMando, vencioSilencio } from "./silencio.js";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function atenderTurno({
  id, env, config, mem, modulos, reglas, pedirAlModelo, enviar, avisar,
  ahora = () => new Date(), pausa = esperar, intento = 0,
}) {
  const modo = env.MODO || "solo-avisos";
  if (modo === "apagado") return "apagado";
  const t = ahora();
  const conv = await mem.conversacion(id);
  if (!conv) return "nada que contestar";
  if (modo !== "solo-avisos" && estaCallado(conv, t)) return "callado";

  let hilo = await mem.hilo(id, config.historial, modo === "simulador");
  const ultimo = pendienteDeLaPersona(hilo, config.dueno.frase_regreso);
  if (!ultimo) return "nada que contestar";
  if (!dentroDeVentana(conv, t)) return "fuera de ventana";
  const quien = [conv.nombre, conv.usuario && `@${conv.usuario}`].filter(Boolean).join(" ") || `la conversación ${id}`;

  // Una foto, un sticker o un audio sin texto.
  const adjunto = leerAdjunto(ultimo.texto);
  if (adjunto) {
    const texto = modulos.voz && adjunto.tipo === "audio" ? await modulos.voz.transcribir(env, adjunto) : null;
    if (!texto) {
      if (config.adjuntos === "avisar") await avisar(`${quien} mandó un adjunto (${adjunto.tipo}) que el bot no entiende. Contéstale tú.`);
      return "adjunto sin texto";
    }
    await mem.cambiarTexto(ultimo.id, `(nota de voz) ${texto}`);
    hilo = hilo.map((h) => (h.id === ultimo.id ? { ...h, texto: `(nota de voz) ${texto}` } : h));
  }

  const conocimiento = String((await modulos.conocimiento.leer(env, mem, config)) || "");
  if (!conocimiento.trim()) {
    await avisar(`El bot no tiene "Lo que sabe" cargado y no le contestó a ${quien}.`);
    return "sin conocimiento";
  }

  // Lo que aportan los módulos (por ejemplo, los horarios libres).
  const extras = [];
  let horarios = null;
  for (const m of prendidos(modulos)) {
    if (!m.contexto) continue;
    try {
      const c = await m.contexto(env, config, conv);
      if (typeof c === "string") extras.push(c);
      else if (c) { extras.push(c.texto); horarios = c.horarios || horarios; }
    } catch (e) {
      console.error(`módulo ${m.nombre}:`, e.message);
    }
  }

  const acciones = accionesDisponibles(config, modulos);
  const sis = sistema({ reglas, acciones, config, conocimiento });
  const esq = esquema({ acciones, config, campos: camposExtra(modulos) });
  const ctx = contexto({ conv, config, extras, regreso: vencioSilencio(conv, t), ahora: t });
  const yaDijo = hilo.filter((h) => h.quien === "bot").map((h) => h.texto);
  // Lo que un módulo necesita para revisar o ejecutar su acción (el menú sale de "Lo que sabes").
  const paraModulos = { env, config, conv, modo, conocimiento, yaDijo, ahora: t };
  const revisores = prendidos(modulos).filter((m) => m.revisar).map((m) => (salida) => m.revisar(salida, paraModulos));
  const revision = { acciones, config, conocimiento, extras, yaDijo, horarios, revisores };
  const marca = await mem.ultimoEntranteId(id);

  // Modelo y revisor: una llamada, y si se rechaza, una más con los motivos.
  const uso = { llamadas: 0, entrada: 0, cache_leida: 0, cache_nueva: 0, salida: 0 };
  const rechazos = [];
  let final = null;
  let forzado = null;
  try {
    let rechazo = null;
    for (let vuelta = 0; vuelta < 2 && !final; vuelta++) {
      const r = await pedirAlModelo(env, { modelo: config.modelo, sistema: sis, usuario: pedido({ contexto: ctx, hilo, rechazo }), esquema: esq });
      for (const k of Object.keys(uso)) uso[k] += r.uso?.[k] || 0;
      const rev = revisar(r.salida, revision);
      if (rev.ok) { final = rev.salida; break; }
      rechazos.push(...rev.motivos);
      rechazo = rev.motivos.join("; ");
      if (vuelta === 1) {
        final = rev.soloForma ? recortar(rev.salida, config) : null;
        if (!final) forzado = rev.motivos;
      }
    }
  } catch (e) {
    if (!(e instanceof ErrorModelo)) throw e;
    if (!e.pase) {
      if (intento < 2 && !e.sinArreglo) return { reintentar: 60000 };
      await avisar(`No logré contestarle a ${quien} (${e.message}). Contéstale tú.\n\nLo último que escribió:\n${ultimo.texto}`);
      return "falló el modelo";
    }
    forzado = [e.message];
  }
  if (forzado) {
    final = revisar({ mensajes: [], accion: "pasar_al_dueno", motivo: `el revisor no dejó salir la respuesta: ${forzado.join("; ")}`, datos: {} }, revision).salida;
  }

  // ¿Sigue valiendo contestar? Si escribió algo nuevo, contesta el turno que ese mensaje programó.
  const vigente = async () => {
    if ((await mem.ultimoEntranteId(id)) !== marca) return "llegó otro mensaje";
    if (modo !== "solo-avisos" && estaCallado(await mem.conversacion(id), ahora())) return "callado";
    return null;
  };

  // La acción.
  let mensajes = [...final.mensajes];
  let avisoDeAccion = null;
  const accion = final.accion;
  const dueno = duenoDeAccion(modulos, accion);
  if (dueno) {
    let r;
    try { r = await dueno.ejecutar(accion, final, paraModulos); } catch (e) { r = { fallo: e.message }; }
    if (r?.fallo) {
      forzado = [`${accion} falló: ${r.fallo}`];
      Object.assign(final, revisar({ mensajes: [], accion: "pasar_al_dueno", motivo: forzado[0], datos: final.datos }, revision).salida);
      mensajes = [...final.mensajes];
    } else {
      mensajes.push(...(r?.mensajes || []));
      if (r?.link) mensajes.push(r.link);
      // Un módulo puede avisarle al dueño sin callar al bot (un pedido, un interesado) y guardar datos.
      avisoDeAccion = r?.aviso || null;
      if (r?.datos) final.datos = { ...final.datos, ...r.datos };
    }
  } else if (acciones[accion]?.link) {
    mensajes.push(acciones[accion].link); // el link lo pone el código, nunca el modelo
  }

  // Mandar, uno por uno. Cada mensaje se anota ANTES de mandarlo: así su eco nunca se confunde con el dueño.
  const pararon = await vigente();
  if (pararon) return pararon;
  for (const [i, texto] of mensajes.entries()) {
    if (i > 0) {
      await pausa(1500 + Math.random() * 2500);
      if (await vigente()) break;
    }
    if (modo !== "encendido") { await mem.anotar(id, "bot", texto, "simulado"); continue; }
    const mid = await mem.anotar(id, "bot", texto, "enviando");
    try {
      const r = await enviar(conv.cuenta, id, texto, `${id}:${mid}`);
      await mem.marcar(mid, "enviado", { externo: r?.id || r?.messageId || null });
    } catch (e) {
      await mem.marcar(mid, "fallo", { error: e.message });
      await avisar(`No pude mandarle un mensaje a ${quien}: ${e.message}`);
      break;
    }
  }
  if (modo === "solo-avisos") {
    await avisar(`[solo avisos] A ${quien} le contestaría:\n\n${mensajes.join("\n") || "(nada)"}\n\nacción: ${accion} (${final.motivo || "sin motivo"})`);
  }

  if (avisoDeAccion) await avisar(modo === "solo-avisos" ? `[solo avisos] ${avisoDeAccion}` : avisoDeAccion);

  if (vencioSilencio(conv, t)) await mem.soltar(id);
  const callar = modo !== "solo-avisos";
  if (accion === "callarse" && callar) await mem.callar(id, hastaCuando(t, config.dueno.horas_silencio), "amigo");
  if (accion === "pasar_al_dueno") {
    if (callar) await mem.callar(id, hastaCuando(t, config.dueno.horas_silencio), "pase");
    await avisar(`Te toca contestar a ${quien} (${conv.canal}).\nMotivo: ${final.motivo || "sin motivo"}\n\nLo último que escribió:\n${ultimo.texto}`);
  }

  await mem.guardarDatos(id, final.datos);
  await mem.registrarTurno(id, { modelo: config.modelo, llamadas: uso.llamadas, uso, accion, motivo: final.motivo, rechazos });
  if (accion === "pasar_al_dueno") return "pasó al dueño";
  if (accion === "callarse") return "se calló";
  return "contestó";
}

// Salió un mensaje de la cuenta. Decide si es el eco del bot, el dueño u otra automatización.
export async function registrarSaliente({ m, mem, config, modo, ahora = () => new Date() }) {
  const quien = quienMando(m, await mem.enviosRecientes(m.conversacion, 15));
  if (quien === "bot") return "eco del bot";
  if (!(await mem.conversacion(m.conversacion))) return "plática que el bot no conoce";
  await mem.anotar(m.conversacion, quien, m.texto || "(nota de voz o adjunto)", "ok");
  if (quien === "otra") return "otra automatización";
  if (modo === "solo-avisos") return "el dueño escribió (en solo-avisos no calla)";
  if (esRegreso(m.texto, config.dueno.frase_regreso)) {
    await mem.soltar(m.conversacion);
    const hilo = await mem.hilo(m.conversacion, 5, modo === "simulador");
    return pendienteDeLaPersona(hilo, config.dueno.frase_regreso) ? "contestar ahora" : "regresó al bot";
  }
  await mem.callar(m.conversacion, hastaCuando(ahora(), config.dueno.horas_silencio), "dueno");
  return "el dueño tomó la plática";
}

// Cuándo contestar: espera a que termine de escribir, pero nunca más que la espera máxima.
export function cuandoContestar(ahoraMs, primeroMs, config) {
  return Math.min(ahoraMs + config.espera_segundos * 1000, primeroMs + config.espera_maxima_segundos * 1000);
}

// El último mensaje sin contestar de la persona, o null. La frase de regreso del dueño no cuenta.
function pendienteDeLaPersona(hilo, frase) {
  const ultimo = [...hilo].reverse().find((h) => !(h.quien === "dueno" && esRegreso(h.texto, frase)));
  return ultimo?.quien === "persona" ? ultimo : null;
}
