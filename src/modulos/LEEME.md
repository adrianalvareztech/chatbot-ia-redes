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
| `pedidos.js` | `modulos.pedidos: true` + `pedidos` (entregas, pago, horario) | ninguna |
| `interesados.js` | `modulos.interesados: true` + `interesados.campos` | ninguna |
| `enlaces.js` | `modulos.enlaces: true` | ninguna |

Qué hace cada uno de los tres últimos:

- **Pedidos** (café, taquería, pastelería, tienda que vende por mensaje). El bot dice qué quiere la
  persona; el código busca cada artículo en "Lo que sabe", suma y escribe el resumen con el total
  (`resumir_pedido`). Cuando la persona confirma (`cerrar_pedido`), el dueño recibe el pedido y la
  persona recibe cómo se paga. Algo que no está en el menú no se puede cobrar.
- **Interesados** (inmobiliaria, cotizaciones, escuela, agencia). Cuando el bot ya tiene los datos
  obligatorios, el dueño los recibe en un aviso (`registrar_interesado`) y el bot sigue atendiendo.
- **Enlaces** (catálogo, propiedades, recursos). El bot manda un link que ya está escrito en "Lo que
  sabe" (`mandar_link`). Para uno o dos links fijos no hace falta: van en `acciones` de `config.js`.

## El contrato

Cada archivo exporta por default un objeto con lo que le toque de esto:

```js
export default {
  nombre: "agenda-cal",
  secretos: ["CAL_API_KEY"],                        // /salud y npm test avisan si falta alguno
  acciones: { agendar: { descripcion: "..." } },    // se suman a las del núcleo
  campos: { cita: { /* JSON Schema */ } },          // campos extra en la respuesta del modelo
  async contexto(env, config, conv) {},             // texto para "ESTA CONVERSACIÓN", o { texto, horarios }
  revisar(salida, ctx) {},                          // → lista de motivos para rechazar la respuesta ([] = pasa)
  async ejecutar(accion, salida, ctx) {},           // → { mensajes?, link?, aviso?, datos?, fallo? }
  async programado(env, config, mem) {},            // lo llama el cron cada 10 min; puede devolver { aviso }
  async leer(env, mem, config) {},                  // solo conocimiento → texto
  async avisar(env, config, texto) {},              // solo aviso; nunca lanza un error
  async transcribir(env, adjunto) {},               // solo voz → texto, o null
};
```

`ctx` es lo mismo en `revisar` y en `ejecutar`: `{ env, config, conv, modo, conocimiento, yaDijo, ahora }`.
`conocimiento` es el texto de "Lo que sabe" y `yaDijo` lo que el bot ya mandó en esta plática.

Reglas:

1. Las acciones del núcleo son `ninguna`, `pasar_al_dueno` y `callarse`. Un módulo agrega las suyas.
2. Un link nunca lo escribe el modelo. Si la acción manda un link, lo devuelve `ejecutar` en `link`.
3. `ejecutar` recibe `modo`. Fuera de `"encendido"` no hace nada que se note afuera (no agenda,
   no cobra): solo responde como si lo hubiera hecho.
4. Si algo sale mal, `ejecutar` devuelve `{ fallo: "por qué" }` y el núcleo le pasa la plática al
   dueño con ese motivo.
5. Un aviso nunca tumba al bot: atrapa sus errores y escribe en el log.
6. Lo que el modelo no debe inventar (un total, un link, un dato que falta) se frena en `revisar`,
   con un motivo que le diga qué corregir. El bot tiene un segundo intento; si vuelve a fallar, la
   plática pasa al dueño.
7. Para avisarle al dueño sin callar al bot (un pedido, un interesado), `ejecutar` devuelve `aviso`.
   Para guardar algo de la persona, devuelve `datos`. Lo que `ejecutar` devuelve en `mensajes` lo
   escribe el código, no el modelo: ahí sí puede ir un total.

## Agregar un módulo nuevo

1. Crea el archivo aquí siguiendo el contrato.
2. Agrégalo al `CATALOGO` de `src/nucleo/modulos.js` (es la única línea del núcleo que se toca).
3. Agrega su opción a `src/negocio/config.js` y su llave a `.dev.vars.example`.
4. Escribe su prueba en `test/` (copia la forma de `test/pedidos.test.js`).
5. `npm test` y prueba en `npm run simular`.
