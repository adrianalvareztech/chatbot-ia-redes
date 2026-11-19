// Lo que sabe el bot, desde src/negocio/conocimiento.md. Cero llaves.
// Para cambiar un precio: edita el archivo y vuelve a subir el bot (npm run deploy).
import texto from "../negocio/conocimiento.md";

export default {
  nombre: "conocimiento-archivo",
  secretos: [],
  // Los comentarios <!-- --> son notas para ti y el bot no los ve.
  async leer() {
    return texto.replace(/<!--[\s\S]*?-->/g, "").trim();
  },
};
