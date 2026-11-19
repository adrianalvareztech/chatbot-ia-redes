// Un Durable Object por conversación. Hace dos trabajos y nada más:
//   1. Fila: los mensajes de una misma plática se atienden uno detrás de otro, nunca dos a la vez.
//   2. Despertador: espera a que la persona termine de escribir y luego contesta (alarma).
// Lo único que guarda es { primero, intentos }, más el id y un contador de mensajes.
// Todo lo demás vive en D1 (memoria.js).
import { DurableObject } from "cloudflare:workers";
import config from "../negocio/config.js";
import reglas from "../negocio/prompt.js";
import { memoria } from "./memoria.js";
import { pedirAlModelo } from "./modelo.js";
import { cargar } from "./modulos.js";
import { atenderTurno, cuandoContestar, registrarSaliente } from "./turno.js";
import { cliente } from "./zernio.js";

export class Conversacion extends DurableObject {
  // Llegó un mensaje de la persona.
  async entrante(m) {
    const mem = memoria(this.env.DB);
    await mem.recibir(m);
    const estado = (await this.ctx.storage.get("estado")) || {};
    const ahora = Date.now();
    const primero = estado.primero || ahora;
    const version = (estado.version || 0) + 1;
    await this.ctx.storage.put("estado", { primero, intentos: 0, id: m.conversacion, version });
    await this.ctx.storage.setAlarm(cuandoContestar(ahora, primero, config));
    return "esperando a que termine de escribir";
  }

  // Salió un mensaje de la cuenta (del bot, del dueño o de otra automatización).
  async saliente(m) {
    const mem = memoria(this.env.DB);
    const r = await registrarSaliente({ m, mem, config, modo: this.env.MODO });
    if (r === "contestar ahora") {
      await this.ctx.storage.put("estado", { primero: Date.now(), intentos: 0, id: m.conversacion, version: Date.now() });
      await this.ctx.storage.setAlarm(Date.now());
    }
    if (r === "el dueño tomó la plática") {
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.delete("estado");
    }
    return r;
  }

  // Sonó la alarma: toca contestar.
  async alarm() {
    const estado = (await this.ctx.storage.get("estado")) || {};
    if (!estado.id) return;
    // Un mensaje que llegue mientras se contesta empieza su propia espera.
    await this.ctx.storage.put("estado", { ...estado, primero: null });
    const modulos = cargar(config);
    const avisar = async (texto) => {
      console.log("[aviso al dueño]", texto);
      if (modulos.aviso) await modulos.aviso.avisar(this.env, config, texto);
    };
    let r;
    try {
      r = await atenderTurno({
        id: estado.id, env: this.env, config, mem: memoria(this.env.DB), modulos, reglas,
        pedirAlModelo, avisar, intento: estado.intentos || 0,
        enviar: (cuenta, conversacion, texto, idem) => cliente(this.env).dm(cuenta, conversacion, texto, idem),
      });
    } catch (e) {
      // Un error que no se esperaba: se reintenta al minuto, máximo dos veces.
      console.error(`turno de ${estado.id}:`, e.stack || e.message);
      r = (estado.intentos || 0) < 2 ? { reintentar: 60000 } : "falló";
      if (r === "falló") await avisar(`El bot tuvo un error con la conversación ${estado.id}: ${e.message}`);
    }
    console.log(`turno ${estado.id}:`, typeof r === "string" ? r : JSON.stringify(r));
    // Si llegó otro mensaje mientras tanto, su alarma ya está puesta y el estado se queda.
    const despues = await this.ctx.storage.get("estado");
    if (despues?.version !== estado.version) return;
    if (r?.reintentar) {
      await this.ctx.storage.put("estado", { ...estado, intentos: (estado.intentos || 0) + 1 });
      await this.ctx.storage.setAlarm(Date.now() + r.reintentar);
      return;
    }
    // Se borra al terminar, no antes: si el Worker se cae a la mitad, la alarma vuelve a sonar.
    await this.ctx.storage.delete("estado");
  }
}
