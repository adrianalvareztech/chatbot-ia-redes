import assert from "node:assert/strict";
import { test } from "node:test";
import { esDeMiCuenta, leerAdjunto, normalizar } from "../src/nucleo/eventos.js";

const recibido = (cambios = {}, extra = {}) => ({
  id: "ev-1",
  event: "message.received",
  account: { accountId: "cuenta-1", platform: "instagram" },
  message: {
    id: "m-1", conversationId: "conv-1", direction: "incoming", text: "Hola", sentAt: "2026-11-18T10:00:00.000Z",
    sender: { id: "p-1", username: "ana", name: "Ana" }, ...cambios,
  },
  ...extra,
});

test("3. message.received con texto es un entrante con todos sus campos", () => {
  assert.deepEqual(normalizar(recibido()), {
    tipo: "entrante", conversacion: "conv-1", cuenta: "cuenta-1", canal: "instagram", persona: "p-1",
    nombre: "Ana", usuario: "ana", texto: "Hola", adjunto: null, fecha: "2026-11-18T10:00:00.000Z",
  });
});

test("4. metadata.standby se ignora", () => {
  assert.equal(normalizar(recibido({}, { metadata: { standby: true } })).tipo, "ignorar");
});

test("5. message.sent es saliente con sentVia tal cual, incluido null", () => {
  const ev = (sentVia) => ({
    event: "message.sent", account: { accountId: "cuenta-1" },
    message: { id: "m-2", conversationId: "conv-1", direction: "outgoing", text: "Va", sentVia },
  });
  const nulo = normalizar(ev(null));
  assert.equal(nulo.tipo, "saliente");
  assert.equal(nulo.sentVia, null);
  assert.equal(nulo.conversacion, "conv-1");
  assert.equal(normalizar(ev("api")).sentVia, "api");
  assert.equal(normalizar(ev("human")).sentVia, "human");
});

test("6. un evento de otra cuenta no es mío", () => {
  assert.equal(esDeMiCuenta(normalizar(recibido({}, { account: { accountId: "otra" } })), ["cuenta-1"]), false);
  assert.equal(esDeMiCuenta(normalizar(recibido()), ["cuenta-1"]), true);
});

test("7. adjunto sin texto es entrante con adjunto y texto vacío", () => {
  const m = normalizar(recibido({ text: "", attachments: [{ type: "audio", url: "https://x/a.mp4" }] }));
  assert.equal(m.tipo, "entrante");
  assert.equal(m.texto, "");
  assert.deepEqual(m.adjunto, { tipo: "audio", url: "https://x/a.mp4" });
  assert.deepEqual(leerAdjunto("[adjunto:audio] https://x/a.mp4"), { tipo: "audio", url: "https://x/a.mp4" });
});

test("8. un evento desconocido se ignora", () => {
  assert.equal(normalizar({ event: "comment.received" }).tipo, "ignorar");
  assert.equal(normalizar({}).tipo, "ignorar");
});
