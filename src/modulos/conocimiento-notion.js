// Lo que sabe el bot, desde Notion. El dueño edita precios y servicios en Notion sin tocar código.
// Cada 10 min el cron copia las fuentes de config.notion.fuentes (páginas o bases) a D1, y el bot
// lee esa copia: así no consulta Notion en cada mensaje (es lenta y tiene límite de peticiones).
// Los cuadros grises (callouts) son notas para el dueño y no se copian.
const NOTION = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const TOPE = 30000; // caracteres; más que esto cuesta caro en cada mensaje

async function pedir(env, ruta, cuerpo) {
  const r = await fetch(NOTION + ruta, {
    method: cuerpo ? "POST" : "GET",
    headers: { authorization: `Bearer ${env.NOTION_TOKEN}`, "notion-version": VERSION, "content-type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Notion respondió ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function todos(env, ruta, cuerpo) {
  const out = [];
  let cursor;
  do {
    const d = cuerpo
      ? await pedir(env, ruta, { ...cuerpo, start_cursor: cursor })
      : await pedir(env, `${ruta}?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`);
    if (!d) return out;
    out.push(...d.results);
    cursor = d.has_more ? d.next_cursor : null;
  } while (cursor);
  return out;
}

const plano = (rich = []) => rich.map((t) => t.plain_text).join("");

// Página → texto. Baja máximo dos niveles de bloques anidados (cada nivel son más peticiones).
async function pagina(env, id, nivel = 0) {
  const lineas = [];
  for (const b of await todos(env, `/blocks/${id}/children`)) {
    const v = b[b.type] || {};
    const sangria = "  ".repeat(nivel);
    switch (b.type) {
      case "callout": continue;
      case "heading_1": lineas.push(`\n# ${plano(v.rich_text)}`); break;
      case "heading_2": lineas.push(`\n## ${plano(v.rich_text)}`); break;
      case "heading_3": lineas.push(`\n### ${plano(v.rich_text)}`); break;
      case "bulleted_list_item": lineas.push(`${sangria}- ${plano(v.rich_text)}`); break;
      case "numbered_list_item": lineas.push(`${sangria}1. ${plano(v.rich_text)}`); break;
      case "to_do": lineas.push(`${sangria}- ${plano(v.rich_text)}`); break;
      case "quote": lineas.push(`> ${plano(v.rich_text)}`); break;
      case "paragraph": lineas.push(plano(v.rich_text)); break;
      case "table":
        for (const fila of await todos(env, `/blocks/${b.id}/children`)) lineas.push(`| ${fila.table_row.cells.map(plano).join(" | ")} |`);
        continue;
      default: break;
    }
    if (b.has_children && nivel < 1) lineas.push(await pagina(env, b.id, nivel + 1));
  }
  return lineas.join("\n");
}

// Una propiedad de una base de Notion → texto.
function valor(p) {
  switch (p?.type) {
    case "title": case "rich_text": return plano(p[p.type]);
    case "number": return p.number ?? "";
    case "select": case "status": return p[p.type]?.name || "";
    case "multi_select": return p.multi_select.map((s) => s.name).join(", ");
    case "checkbox": return p.checkbox ? "sí" : "no";
    case "date": return p.date ? [p.date.start, p.date.end].filter(Boolean).join(" a ") : "";
    case "url": case "email": case "phone_number": return p[p.type] || "";
    case "formula": return p.formula?.[p.formula?.type] ?? "";
    default: return "";
  }
}

// Base → una línea por fila: "- Nombre: Limpieza | Precio: 800 | Disponible: sí".
async function base(env, id, info) {
  const titulo = plano(info.title) || "Base";
  const filas = await todos(env, `/databases/${id}/query`, { page_size: 100 });
  const lineas = filas.map((f) => `- ${Object.entries(f.properties)
    .map(([nombre, p]) => [nombre, valor(p)]).filter(([, v]) => v !== "").map(([n, v]) => `${n}: ${v}`).join(" | ")}`);
  return `## ${titulo}\n${lineas.join("\n")}`;
}

async function copiar(env, config, mem) {
  const partes = [];
  for (const id of config.notion.fuentes) {
    const info = await pedir(env, `/databases/${id}`);
    partes.push(info ? await base(env, id, info) : await pagina(env, id));
  }
  const texto = partes.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!texto) return { aviso: "Notion no devolvió nada. ¿Compartiste la página o la base con la integración?" };
  await mem.guardarConocimiento("notion", texto);
  if (texto.length > TOPE) return { aviso: `Lo que sabe el bot en Notion mide ${texto.length} caracteres (tope sugerido ${TOPE}). Cada mensaje cuesta más: recórtalo.` };
  return null;
}

export default {
  nombre: "conocimiento-notion",
  secretos: ["NOTION_TOKEN"],
  // La primera vez, si el cron todavía no lo copió, lo copia en ese momento.
  async leer(env, mem, config) {
    const guardado = await mem.conocimiento("notion");
    if (guardado || !config) return guardado;
    await copiar(env, config, mem);
    return mem.conocimiento("notion");
  },
  programado: (env, config, mem) => copiar(env, config, mem),
};
