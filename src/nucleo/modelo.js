// La llamada a Claude. Una sola llamada por turno, con la respuesta atada a un molde (esquema):
// el modelo no puede contestar texto suelto, solo el objeto que el código entiende.
// El SDK de Anthropic reintenta solo cuando la API está saturada (429) o falla (5xx).
import Anthropic from "@anthropic-ai/sdk";

export class ErrorModelo extends Error {
  // `pase`: el modelo se negó o se quedó sin espacio. No sirve reintentar: pasa al dueño.
  // `sinArreglo`: error de configuración (llave mala, petición mal armada). Reintentar no sirve.
  constructor(mensaje, { pase = false, sinArreglo = false, causa = null } = {}) {
    super(mensaje);
    this.pase = pase;
    this.sinArreglo = sinArreglo;
    this.causa = causa;
  }
}

export async function pedirAlModelo(env, { modelo, sistema, usuario, esquema }) {
  const claude = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, timeout: 25000 });
  let r;
  try {
    r = await claude.messages.create({
      model: modelo,
      max_tokens: 1000,
      // Un mensaje corto no necesita pensar antes. Sonnet lo apaga con "between_tools"
      // (sin herramientas no piensa); Haiku con "disabled".
      thinking: /haiku/.test(modelo) ? { type: "disabled" } : { type: "between_tools" },
      output_config: { effort: "low", format: { type: "json_schema", schema: esquema } },
      system: sistema,
      messages: [{ role: "user", content: usuario }],
    });
  } catch (e) {
    const detalle = e instanceof Anthropic.APIError ? `${e.status ?? "sin respuesta"}: ${e.message}` : e.message;
    const sinArreglo = e instanceof Anthropic.APIError && [400, 401, 403, 404].includes(e.status);
    throw new ErrorModelo(`Claude no contestó (${detalle})`, { causa: e, sinArreglo });
  }

  const u = r.usage || {};
  const uso = {
    llamadas: 1,
    entrada: u.input_tokens || 0,
    cache_leida: u.cache_read_input_tokens || 0,
    cache_nueva: u.cache_creation_input_tokens || 0,
    salida: u.output_tokens || 0,
  };
  if (r.stop_reason === "refusal") throw new ErrorModelo("Claude se negó a contestar este mensaje", { pase: true });
  if (r.stop_reason === "max_tokens") throw new ErrorModelo("la respuesta de Claude salió cortada", { pase: true });

  const texto = (r.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  let salida = null;
  try {
    salida = JSON.parse(texto);
  } catch {
    salida = null; // el revisor lo rechaza como "no es el objeto pedido"
  }
  return { salida, uso };
}
