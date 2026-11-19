// Imprime el prompt completo, ya armado, tal como lo lee el modelo. Uso: npm run prompt
// Al final enseña lo que el código (no el bot) puede hacer con "Lo que sabe": qué se puede pedir
// y a qué precio, y qué links puede mandar.
import config from "../src/negocio/config.js";
import reglas from "../src/negocio/prompt.js";
import archivo from "../src/modulos/conocimiento-archivo.js";
import { enlacesDe } from "../src/modulos/enlaces.js";
import { dinero, leerMenu } from "../src/modulos/pedidos.js";
import { accionesDisponibles, camposExtra, cargar } from "../src/nucleo/modulos.js";
import { contexto, esquema, pedido, sistema } from "../src/nucleo/prompt.js";

const modulos = cargar(config);
const acciones = accionesDisponibles(config, modulos);
const deArchivo = await archivo.leer();
const conocimiento = config.modulos.conocimiento === "archivo"
  ? deArchivo
  : "(aquí va lo que trae Notion; el bot lo copia cada 10 minutos)";

const extras = [];
if (config.modulos.agenda === "cal") extras.push("HORARIOS LIBRES: (aquí van los horarios que trae Cal.com)");
if (modulos.pedidos) extras.push(await modulos.pedidos.contexto({}, config));
const conv = { canal: "instagram", nombre: "Persona de prueba", usuario: "prueba", datos: {} };
const hilo = [{ quien: "persona", texto: "Hola, quiero información" }];

const linea = "=".repeat(70);
const [reglasYAcciones, loQueSabes] = sistema({ reglas, acciones, config, conocimiento });
console.log(`${linea}\nSISTEMA (parte 1: reglas, acciones y formato)\n${linea}\n${reglasYAcciones.text}\n`);
console.log(`${linea}\nSISTEMA (parte 2: lo que sabe, con caché)\n${linea}\n${loQueSabes.text}\n`);
console.log(`${linea}\nMENSAJE DE EJEMPLO (cambia en cada turno)\n${linea}\n${pedido({ contexto: contexto({ conv, config, extras, ahora: new Date() }), hilo })}\n`);
console.log(`${linea}\nMOLDE DE LA RESPUESTA\n${linea}\n${JSON.stringify(esquema({ acciones, config, campos: camposExtra(modulos) }), null, 2)}`);
console.log(`\nLo que sabe mide ${conocimiento.length} caracteres (tope sugerido: 30,000).`);

const nota = config.modulos.conocimiento === "notion" ? " (leído de conocimiento.md; en Notion tiene que quedar con el mismo formato)" : "";
if (modulos.pedidos) {
  const menu = leerMenu(deArchivo);
  console.log(`\n${linea}\nLO QUE SE PUEDE PEDIR${nota}\n${linea}`);
  console.log(menu.length
    ? menu.map((a) => `- ${a.nombre}: ${dinero(a.precio, config.pedidos.moneda)}${a.disponible ? "" : "  (no disponible)"}`).join("\n")
    : "(nada: cada artículo va en una tabla con columna Precio, o en una línea \"Nombre: $precio\")");
  console.log("Si aquí falta algo o sobra algo, corrige conocimiento.md: el total de un pedido sale de esta lista.");
}
if (modulos.enlaces) {
  const links = [...enlacesDe(deArchivo, config)];
  console.log(`\n${linea}\nLINKS QUE PUEDE MANDAR${nota}\n${linea}\n${links.map((l) => `- ${l}`).join("\n") || "(ninguno)"}`);
}
