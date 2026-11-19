// Imprime el prompt completo, ya armado, tal como lo lee el modelo. Uso: npm run prompt
import config from "../src/negocio/config.js";
import reglas from "../src/negocio/prompt.js";
import { accionesDisponibles, camposExtra, cargar } from "../src/nucleo/modulos.js";
import { contexto, esquema, pedido, sistema } from "../src/nucleo/prompt.js";

const modulos = cargar(config);
const acciones = accionesDisponibles(config, modulos);
const conocimiento = config.modulos.conocimiento === "archivo"
  ? await modulos.conocimiento.leer()
  : "(aquí va lo que trae Notion; el bot lo copia cada 10 minutos)";

const extras = config.modulos.agenda === "cal" ? ["HORARIOS LIBRES: (aquí van los horarios que trae Cal.com)"] : [];
const conv = { canal: "instagram", nombre: "Persona de prueba", usuario: "prueba", datos: {} };
const hilo = [{ quien: "persona", texto: "Hola, quiero información" }];

const linea = "=".repeat(70);
const [reglasYAcciones, loQueSabes] = sistema({ reglas, acciones, config, conocimiento });
console.log(`${linea}\nSISTEMA (parte 1: reglas, acciones y formato)\n${linea}\n${reglasYAcciones.text}\n`);
console.log(`${linea}\nSISTEMA (parte 2: lo que sabe, con caché)\n${linea}\n${loQueSabes.text}\n`);
console.log(`${linea}\nMENSAJE DE EJEMPLO (cambia en cada turno)\n${linea}\n${pedido({ contexto: contexto({ conv, config, extras, ahora: new Date() }), hilo })}\n`);
console.log(`${linea}\nMOLDE DE LA RESPUESTA\n${linea}\n${JSON.stringify(esquema({ acciones, config, campos: camposExtra(modulos) }), null, 2)}`);
console.log(`\nLo que sabe mide ${conocimiento.length} caracteres (tope sugerido: 30,000).`);
