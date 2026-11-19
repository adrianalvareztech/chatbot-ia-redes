// Node no sabe importar archivos .md; Cloudflare sí (regla [[rules]] de wrangler.toml).
// Esto le enseña a Node a importarlos como texto, para las pruebas y los scripts.
import { register } from "node:module";

register("data:text/javascript," + encodeURIComponent(`
  import { readFile } from "node:fs/promises";
  import { fileURLToPath } from "node:url";
  export async function load(url, context, next) {
    if (url.endsWith(".md")) {
      const texto = await readFile(fileURLToPath(url), "utf8");
      return { format: "module", source: "export default " + JSON.stringify(texto), shortCircuit: true };
    }
    return next(url, context);
  }
`));
