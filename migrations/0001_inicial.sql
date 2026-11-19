-- La memoria del bot. Fechas en ISO 8601 UTC.

-- Webhooks ya vistos: Zernio entrega al menos una vez.
CREATE TABLE eventos_vistos (
  evento_id TEXT PRIMARY KEY,
  fecha     TEXT NOT NULL
);

-- Una fila por plática. `callado_hasta` es la única fuente de "el bot no contesta aquí".
CREATE TABLE conversaciones (
  id              TEXT PRIMARY KEY,            -- conversationId de Zernio
  cuenta          TEXT NOT NULL,               -- accountId de Zernio
  canal           TEXT NOT NULL,               -- instagram | whatsapp | facebook
  persona         TEXT NOT NULL,
  nombre          TEXT,
  usuario         TEXT,
  datos           TEXT NOT NULL DEFAULT '{}',  -- JSON: lo que se sabe de la persona
  ultimo_entrante TEXT,                        -- de aquí sale la ventana de 24 h
  callado_hasta   TEXT,                        -- NULL = atiende el bot
  callado_motivo  TEXT,                        -- dueno | pase | amigo
  creada          TEXT NOT NULL,
  actualizada     TEXT NOT NULL
);
CREATE INDEX conversaciones_callado ON conversaciones (callado_hasta);

-- Todo lo que se dijo, de los tres lados.
CREATE TABLE mensajes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  conversacion TEXT NOT NULL,
  quien        TEXT NOT NULL CHECK (quien IN ('persona', 'bot', 'dueno', 'otra')),
  texto        TEXT NOT NULL,
  fecha        TEXT NOT NULL,
  estado       TEXT NOT NULL DEFAULT 'ok'
               CHECK (estado IN ('ok', 'enviando', 'enviado', 'simulado', 'fallo')),
  externo      TEXT,                           -- id del mensaje en Zernio, si lo dio
  error        TEXT
);
CREATE INDEX mensajes_hilo ON mensajes (conversacion, id);
CREATE INDEX mensajes_bot ON mensajes (quien, estado, fecha);

-- Un renglón por turno: cuánto costó y por qué hizo lo que hizo.
CREATE TABLE turnos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  conversacion TEXT NOT NULL,
  fecha        TEXT NOT NULL,
  modelo       TEXT NOT NULL,
  llamadas     INTEGER NOT NULL,               -- 2 = el revisor rechazó la primera
  entrada      INTEGER NOT NULL,
  cache_leida  INTEGER NOT NULL,
  cache_nueva  INTEGER NOT NULL,
  salida       INTEGER NOT NULL,
  accion       TEXT,
  motivo       TEXT,
  rechazos     TEXT
);
CREATE INDEX turnos_fecha ON turnos (fecha);

-- Copia de lo que sabe el bot cuando viene de Notion.
CREATE TABLE conocimiento (
  clave       TEXT PRIMARY KEY,
  texto       TEXT NOT NULL,
  actualizado TEXT NOT NULL
);
