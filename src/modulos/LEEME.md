# Módulos

Un módulo es una pieza que se prende desde `src/negocio/config.js`. El núcleo no cambia: solo
llama a lo que cada módulo trae.

| Archivo | Se prende con | Llave que pide |
|---|---|---|
| `conocimiento-archivo.js` | `modulos.conocimiento: "archivo"` | ninguna |
| `conocimiento-notion.js` | `modulos.conocimiento: "notion"` + `notion.fuentes` | `NOTION_TOKEN` |
| `agenda-link.js` | `modulos.agenda: "link"` + `agenda.link` | ninguna |
| `agenda-cal.js` | `modulos.agenda: "cal"` + `agenda.tipo_de_cita` | `CAL_API_KEY` |
| `aviso-telegram.js` | `modulos.aviso: "telegram"` + `aviso.telegram_chat` | `TELEGRAM_BOT_TOKEN` |
| `aviso-correo.js` | `modulos.aviso: "correo"` + `aviso.correo` | `RESEND_API_KEY` |
| `voz.js` | `modulos.voz: true` + `[ai]` en `wrangler.toml` | ninguna |

## El contrato

Cada archivo exporta por default un objeto con lo que le toque de esto:

```js
export default {
  nombre: "agenda-cal",
  secretos: ["CAL_API_KEY"],                        // /salud y npm test avisan si falta alguno
  acciones: { agendar: { descripcion: "..." } },    // se suman a las del núcleo
  campos: { cita: { /* JSON Schema */ } },          // campos extra en la respuesta del modelo
  async contexto(env, config, conv) {},             // texto para "ESTA CONVERSACIÓN", o { texto, horarios }
  async ejecutar(accion, salida, { env, config, conv, modo }) {},  // → { mensajes?, link?, fallo? }
  async programado(env, config, mem) {},            // lo llama el cron cada 10 min; puede devolver { aviso }
  async leer(env, mem, config) {},                  // solo conocimiento → texto
  async avisar(env, config, texto) {},              // solo aviso; nunca lanza un error
  async transcribir(env, adjunto) {},               // solo voz → texto, o null
};
```

Reglas:

1. Las acciones del núcleo son `ninguna`, `pasar_al_dueno` y `callarse`. Un módulo agrega las suyas.
2. Un link nunca lo escribe el modelo. Si la acción manda un link, lo devuelve `ejecutar` en `link`.
3. `ejecutar` recibe `modo`. Fuera de `"encendido"` no hace nada que se note afuera (no agenda,
   no cobra): solo responde como si lo hubiera hecho.
4. Si algo sale mal, `ejecutar` devuelve `{ fallo: "por qué" }` y el núcleo le pasa la plática al
   dueño con ese motivo.
5. Un aviso nunca tumba al bot: atrapa sus errores y escribe en el log.

## Agregar un módulo nuevo

1. Crea el archivo aquí siguiendo el contrato.
2. Agrégalo al `CATALOGO` de `src/nucleo/modulos.js` (es la única línea del núcleo que se toca).
3. Agrega su opción a `src/negocio/config.js` y su llave a `.dev.vars.example`.
4. `npm test` y prueba en `npm run simular`.
