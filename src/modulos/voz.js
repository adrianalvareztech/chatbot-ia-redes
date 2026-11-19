// Notas de voz a texto, con Whisper dentro de Cloudflare (Workers AI).
// Para prenderlo: modulos.voz = true en config.js y descomenta [ai] en wrangler.toml.

export default {
  nombre: "voz",
  secretos: [],
  // Devuelve lo que dijo, o null si no se pudo. Con null el bot avisa al dueño en vez de adivinar.
  async transcribir(env, adjunto) {
    if (!env.AI || !adjunto?.url) return null;
    try {
      const audio = await (await fetch(adjunto.url)).arrayBuffer();
      const r = await env.AI.run("@cf/openai/whisper-large-v3-turbo", { audio: aBase64(audio) });
      return r?.text?.trim() || null;
    } catch (e) {
      console.error("transcripción:", e.message);
      return null;
    }
  },
};

function aBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
