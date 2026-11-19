// La firma del webhook. Zernio firma cada evento con el secreto que tú inventaste:
// X-Zernio-Signature = HMAC-SHA256 en hexadecimal del cuerpo tal cual llegó.
// Si la firma no cuadra, el evento no viene de Zernio y se rechaza.

export async function firmaValida(cuerpo, firma, secreto) {
  if (!firma || !secreto) return false;
  const llave = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", llave, new TextEncoder().encode(cuerpo)));
  const esperada = [...mac].map((b) => b.toString(16).padStart(2, "0")).join("");
  const dada = String(firma).replace(/^sha256=/i, "").toLowerCase();
  if (dada.length !== esperada.length) return false;
  // Comparación en tiempo constante: no se corta en la primera letra distinta.
  let diferencia = 0;
  for (let i = 0; i < dada.length; i++) diferencia |= dada.charCodeAt(i) ^ esperada.charCodeAt(i);
  return diferencia === 0;
}
