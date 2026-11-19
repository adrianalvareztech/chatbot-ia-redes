// La memoria del bot. Es el único archivo que habla con la base de datos (D1).
// Todo lo que el bot recuerda se puede consultar con:
//   npx wrangler d1 execute chatbot --remote --command "SELECT * FROM conversaciones"
import { marcaAdjunto } from "./eventos.js";

const ahora = () => new Date().toISOString();

export function memoria(db) {
  const uno = (sql, ...p) => db.prepare(sql).bind(...p).first();
  const varios = async (sql, ...p) => (await db.prepare(sql).bind(...p).all()).results || [];
  const correr = (sql, ...p) => db.prepare(sql).bind(...p).run();

  return {
    // true si el evento es nuevo. Zernio a veces manda el mismo dos veces.
    async eventoNuevo(id) {
      const r = await correr("INSERT OR IGNORE INTO eventos_vistos (evento_id, fecha) VALUES (?, ?)", id, ahora());
      return (r.meta?.changes || 0) > 0;
    },

    // Si no se pudo procesar, se olvida para que el reintento de Zernio sí entre.
    olvidarEvento(id) {
      return correr("DELETE FROM eventos_vistos WHERE evento_id = ?", id);
    },

    // Llegó un mensaje: crea la conversación si es nueva y anota lo que dijo.
    async recibir(m) {
      const fecha = m.fecha || ahora();
      await correr(
        `INSERT INTO conversaciones (id, cuenta, canal, persona, nombre, usuario, ultimo_entrante, creada, actualizada)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           nombre = COALESCE(excluded.nombre, nombre),
           usuario = COALESCE(excluded.usuario, usuario),
           ultimo_entrante = excluded.ultimo_entrante,
           actualizada = excluded.actualizada`,
        m.conversacion, m.cuenta || "", m.canal || "instagram", m.persona, m.nombre || null, m.usuario || null,
        fecha, fecha, fecha,
      );
      const texto = m.texto || (m.adjunto ? marcaAdjunto(m.adjunto) : "");
      return this.anotar(m.conversacion, "persona", texto, "ok", fecha);
    },

    async conversacion(id) {
      const c = await uno("SELECT * FROM conversaciones WHERE id = ?", id);
      if (!c) return null;
      return { ...c, datos: JSON.parse(c.datos || "{}") };
    },

    // Los últimos mensajes de la plática, del más viejo al más nuevo. Lo que falló al mandarse
    // no llegó a la persona, así que no cuenta.
    async hilo(id, cuantos = 30, conSimulados = false) {
      const filas = await varios(
        `SELECT id, quien, texto, fecha FROM mensajes
         WHERE conversacion = ? AND estado != 'fallo' AND (estado != 'simulado' OR ?)
         ORDER BY id DESC LIMIT ?`,
        id, conSimulados ? 1 : 0, cuantos,
      );
      return filas.reverse();
    },

    async ultimoEntranteId(id) {
      const r = await uno("SELECT MAX(id) AS id FROM mensajes WHERE conversacion = ? AND quien = 'persona'", id);
      return r?.id || 0;
    },

    async anotar(id, quien, texto, estado = "ok", fecha = ahora()) {
      const r = await correr(
        "INSERT INTO mensajes (conversacion, quien, texto, fecha, estado) VALUES (?, ?, ?, ?, ?)",
        id, quien, texto, fecha, estado,
      );
      return r.meta?.last_row_id;
    },

    marcar(mensajeId, estado, { externo = null, error = null } = {}) {
      return correr("UPDATE mensajes SET estado = ?, externo = COALESCE(?, externo), error = ? WHERE id = ?",
        estado, externo, error, mensajeId);
    },

    // Para cambiar la marca de un audio por lo que dijo, ya transcrito.
    cambiarTexto(mensajeId, texto) {
      return correr("UPDATE mensajes SET texto = ? WHERE id = ?", texto, mensajeId);
    },

    // Lo que el bot mandó (o está mandando) en esta plática en los últimos minutos.
    // Sirve para reconocer el eco de Meta y no confundirlo con el dueño.
    async enviosRecientes(id, minutos = 15) {
      const desde = new Date(Date.now() - minutos * 60000).toISOString();
      const filas = await varios(
        `SELECT texto FROM mensajes WHERE conversacion = ? AND quien = 'bot'
         AND estado IN ('enviando', 'enviado', 'simulado') AND fecha >= ?`,
        id, desde,
      );
      return filas.map((f) => f.texto);
    },

    callar(id, hasta, motivo) {
      return correr("UPDATE conversaciones SET callado_hasta = ?, callado_motivo = ?, actualizada = ? WHERE id = ?",
        hasta, motivo, ahora(), id);
    },

    soltar(id) {
      return correr("UPDATE conversaciones SET callado_hasta = NULL, callado_motivo = NULL, actualizada = ? WHERE id = ?",
        ahora(), id);
    },

    // Mezcla lo nuevo con lo que ya se sabía. Un dato vacío no borra uno que ya estaba.
    async guardarDatos(id, datos) {
      const nuevos = Object.fromEntries(Object.entries(datos || {}).filter(([, v]) => v !== null && v !== ""));
      if (!Object.keys(nuevos).length) return;
      const c = await this.conversacion(id);
      if (!c) return;
      await correr("UPDATE conversaciones SET datos = ?, actualizada = ? WHERE id = ?",
        JSON.stringify({ ...c.datos, ...nuevos }), ahora(), id);
    },

    registrarTurno(id, { modelo, llamadas = 0, uso = {}, accion = null, motivo = null, rechazos = [] }) {
      return correr(
        `INSERT INTO turnos (conversacion, fecha, modelo, llamadas, entrada, cache_leida, cache_nueva, salida, accion, motivo, rechazos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, ahora(), modelo, llamadas, uso.entrada || 0, uso.cache_leida || 0, uso.cache_nueva || 0, uso.salida || 0,
        accion, motivo, rechazos.length ? rechazos.join(" | ") : null,
      );
    },

    // Mensajes que el bot mandó este mes. Zernio corta en 10,000 si no tienes tarjeta.
    async enviadosDelMes() {
      const d = new Date();
      const inicio = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
      const r = await uno("SELECT COUNT(*) AS n FROM mensajes WHERE quien = 'bot' AND estado = 'enviado' AND fecha >= ?", inicio);
      return r?.n || 0;
    },

    async conocimiento(clave) {
      return (await uno("SELECT texto FROM conocimiento WHERE clave = ?", clave))?.texto || "";
    },

    guardarConocimiento(clave, texto) {
      return correr(
        `INSERT INTO conocimiento (clave, texto, actualizado) VALUES (?, ?, ?)
         ON CONFLICT (clave) DO UPDATE SET texto = excluded.texto, actualizado = excluded.actualizado`,
        clave, texto, ahora(),
      );
    },

    purgar(dias = 7) {
      const antes = new Date(Date.now() - dias * 86400000).toISOString();
      return correr("DELETE FROM eventos_vistos WHERE fecha < ?", antes);
    },
  };
}
