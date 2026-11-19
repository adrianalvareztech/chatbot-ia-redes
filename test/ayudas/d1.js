// Una base D1 de mentiras sobre SQLite (viene con Node 22.13 o más nuevo).
// Corre la migración real, así las pruebas usan las mismas tablas que la nube.
import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

const carpeta = new URL("../../migrations/", import.meta.url);

export function d1Falso() {
  const db = new DatabaseSync(":memory:");
  for (const archivo of readdirSync(carpeta).filter((f) => f.endsWith(".sql")).sort()) {
    db.exec(readFileSync(new URL(archivo, carpeta), "utf8"));
  }
  const declaracion = (sql, params = []) => ({
    bind: (...p) => declaracion(sql, p),
    first: async () => db.prepare(sql).get(...params) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...params) }),
    run: async () => {
      const r = db.prepare(sql).run(...params);
      return { meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid) } };
    },
  });
  return { prepare: (sql) => declaracion(sql) };
}
