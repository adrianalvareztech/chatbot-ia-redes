# Cómo se escribe `src/negocio/` (paso 4)

Cinco archivos, en este orden. Todo sale de `PRD.md` y `plan.md`. Lo que no esté ahí, no existe.

## 1. `src/negocio/conocimiento.md` · Lo que sabe

Es lo único de donde el bot puede sacar un precio, un horario, un teléfono, un correo o un link.

- Borra todo el ejemplo de la clínica, incluida la nota de arriba.
- Primera línea: `# Nombre del negocio`, y una o dos líneas de qué es.
- Secciones con `##`, cortas. Tablas para listas con precio. Frases simples para lo demás.
- Solo datos que dio la persona, con sus palabras. No completes, no redondees, no "mejores".
- Un dato pendiente no se escribe. Va como nota: `<!-- PENDIENTE: horario del domingo -->`.
  El bot no lee lo que va entre `<!--` y `-->`.
- Algo que existe pero todavía no tiene precio o link (un recurso sin link, un terreno sin
  página) sí se escribe, sin el dato que falta y diciéndolo: "Checklist de impuestos: todavía
  no está disponible". Así el bot sabe que existe y no manda nada inventado.
- Si el negocio no quiere prometer algo (tiempos de entrega, fechas), escríbelo como lo dijo:
  "No prometemos un tiempo exacto: depende de cuántos pedidos haya". Así el bot tiene qué contestar.
- El horario va siempre aquí, aunque también esté en `config.js` (el horario de pedidos).
- Sigue el "Formato de Lo que sabe" del archivo del tipo.
- Si hay pedidos: cada cosa que se puede pedir es **un renglón con un solo precio**, en una tabla
  con columna `Precio`. Columnas opcionales que el sistema entiende: `Disponible` (`no` = hoy
  no hay), `Días` (`viernes, sábado` = solo esos días) y `Opciones` o `Tallas` (`6, 7, 8` = el
  bot tiene que preguntar cuál antes de resumir). No llenes `Disponible` si nadie te dijo qué hay. Lo que no se pide (el envío, una promoción) va en frases, fuera de esas
  tablas, y nunca en la forma `Algo: $precio` al final de la línea.
- Si hay enlaces: cada link completo, con `https://`, en el renglón de lo que enlaza.
- Con `revisor.precios: "nunca"` no escribas precios aquí.

**Si el plan dice Notion:** escribe `conocimiento.md` igual, completo. Es el borrador que la
persona va a pegar en Notion en la fase 3, y lo que usan las pruebas. En el paso 4 `config.js`
se queda con `conocimiento: "archivo"`; se cambia a `"notion"` en la fase 3.

## 2. `src/negocio/config.js` · Las piezas

- Edita el archivo que ya existe. **Conserva todas las llaves y sus comentarios**; cambia solo
  los valores. No borres opciones de piezas apagadas: déjalas como vienen (el link de ejemplo
  de Cal.com puede quedarse si la agenda está apagada; `npm run pendientes` no lo cuenta).
- Si el plan dice Notion, deja esta nota junto a `conocimiento: "archivo"`:
  `// PENDIENTE: cambiar a "notion" en la fase de Notion`. Así no se sube leyendo el archivo.
- `pedidos.moneda`: la del país del negocio (México: `"MXN"`). Dile cuál pusiste.
- "A partir de 12 piezas lo veo yo" se escribe como tope 11: el tope es lo último que el bot sí cierra.
- `dueno.frase_regreso`: de tú o de usted, como hable el negocio.
- Borra el párrafo "EJEMPLO: lo que ves es una clínica dental..." del encabezado.
- `negocio`, `zona_horaria`, `modulos`, y lo que diga la sección 3 del plan, valor por valor.
- `zernio.cuentas` se queda como `["ID_DE_LA_CUENTA"]` hasta el paso 6.
- `aviso.telegram_chat` se queda en `""` hasta que la persona corra `npm run telegram-chat`.
- `datos`: nombres cortos, en minúsculas, sin acentos, con guion bajo. No uses `ficha_enviada`
  ni `ultimo_pedido`: son del sistema.
- Todo dato que pida una forma de entrega (`pedidos.entregas.<forma>.pide`) y todo campo de
  `interesados.campos` tiene que estar también en `datos`.
- `acciones`: una por cada link fijo. Nombre en minúsculas con guion bajo (`mandar_tienda`),
  `descripcion` que diga cuándo se usa, y `link`.
- `dueno.frases_pase`: las tres que aprobó la persona.
- `revisor.enlaces`: links que el bot puede escribir y que no están en `conocimiento.md`.
- Un valor que falta lleva la palabra `PENDIENTE`. Un link que falta: `"https://PENDIENTE"`.
- Aquí no va ninguna llave.

## 3. `src/negocio/prompt.js` · Cómo se porta

Usa `plantillas/plantilla-prompt-bot.md`. Escribe las partes 1 a 6 con estos títulos, tal cual:
el párrafo de quién eres, `TU META`, `EL CAMINO`, `CÓMO ESCRIBES`, `LO QUE NUNCA HACES`, `CASOS`.

- Borra el comentario "EJEMPLO de una clínica dental..." y deja los otros dos comentarios.
- **Una sola meta**: la del PRD, sección 2.
- **El camino** sale del PRD, sección 8, y de "El camino, para el prompt" del archivo del tipo.
- **Cada acción se nombra con la palabra "acción" adelante**: `acción mandar_link_cita`. Nombra
  todas las acciones de las piezas prendidas y ninguna otra. `npm test` lo revisa en los dos
  sentidos. Para ver cuáles hay: `npm run prompt`, sección ACCIONES.
- **Cómo escribes**: de tú o de usted, emojis sí o no, tal como lo pidió. No copies sus
  mensajes de ejemplo: describe cómo suenan.
- **Lo que nunca haces**: la sección 9 del PRD completa.
- **Casos**: cada renglón de la sección 10 del PRD (cuándo pasa a una persona) es un caso con
  `acción pasar_al_dueno`. Estos van siempre, en todo negocio:
  - Queja o enojo: `acción pasar_al_dueno`.
  - Pide hablar con una persona: `acción pasar_al_dueno`.
  - Pregunta algo que no está en "Lo que sabes": `acción pasar_al_dueno`.
  - Le preguntan el precio, si es un bot, o escriben solo "info" o "precio": lo que dijo en la entrevista.
  - Escriben fuera de horario: lo que dijo en la entrevista.
  - Mandan una foto: no hay caso que escribir, el sistema le avisa al dueño solo. Si el
    negocio pide fotos o comprobantes, el bot dice que las manden por ahí y que las ve una persona.
  - Le hablan como amigo o conocido del dueño: `acción callarse`.
- **El link siempre llega al final.** Cuando una acción manda un link, el sistema lo manda
  después de los mensajes del bot en ese turno. Escribe el camino sabiendo eso: el mensaje
  que acompaña al link va antes, y no lleva una pregunta que la persona tenga que contestar
  antes de abrirlo.
- **Aquí no van precios, links, teléfonos, direcciones ni horarios.** Eso vive en
  `conocimiento.md`. `npm test` rechaza un prompt con un precio o un link.
- No escribas la parte 7: la arma el sistema.
- Sin guion largo y sin signos de apertura (¿ ¡) en los ejemplos: el sistema los quita.

## 4. `test/guiones/*.txt` · Las pláticas para el simulador

Las que dice el archivo del tipo, más la prueba propia de la persona (PRD 12) como una
plática más. Salen de 4 a 6.

- Una línea por mensaje de la persona. Las líneas con `#` son notas. Comandos: `/dueno texto`,
  `/regreso`, `/nueva`, `/estado`, `/rafaga a | b | c`, `/foto` (manda solo una foto).
- La primera siempre se llama `camino-ideal.txt` (reescribe la del ejemplo).
- Arriba de cada una, en notas con `#`: qué prueba y **qué debería pasar**, en una o dos líneas.
- Escribe como escribe un cliente de ese negocio, con productos y datos reales de
  `conocimiento.md`. Nada de "producto X".

## 5. `test/mi-negocio.test.js` · Las mismas pláticas, sin llaves

Reescribe el archivo del ejemplo. Usa `test/ayudas/platica.js`: corre el sistema de verdad con
`config.js`, `prompt.js` y `conocimiento.md` del negocio; lo único falso es el modelo, y tú le
dictas qué contesta. Sirve para saber que las piezas están bien conectadas.

```js
const p = await platica();
const r = await p.turno("lo que escribe la persona", p.dice(["lo que contesta el bot"], "accion", { datos: {...}, pedido: {...} }));
// r.estado, r.mensajes, r.avisos, r.rechazo
```

- `p.dice(mensajes, accion, extra)`: la respuesta del modelo. Si le pasas dos a `p.turno`, la
  segunda es el reintento cuando el revisor rechaza la primera.
- `r.estado`: `"contestó"`, `"pasó al dueño"`, `"se calló"` o `"callado"`.
- `r.mensajes`: lo que le llegaría a la persona. `r.avisos`: lo que le llegaría al dueño.
- `r.rechazo`: por qué el revisor rechazó la primera respuesta, o `null`.
- `p.dueno("texto")`: el dueño contesta a mano. `p.datos()`: lo guardado de la persona.
- `p.adjunto("imagen")`: la persona manda solo una foto. Da estado `"adjunto sin texto"`, cero
  mensajes y un aviso al dueño.
- **El reloj.** Si hay horario de pedidos o cosas que solo hay ciertos días, fija la hora para
  que la prueba dé lo mismo siempre: `platica({ ahora: new Date("2026-11-20T18:00:00Z") })`.
  Elige un momento en que el negocio esté abierto y dilo en un comentario.

Una prueba por plática de `test/guiones/`. Qué revisa cada una, según las piezas:

| Pieza | Qué revisa la prueba |
|---|---|
| Agenda con link | Con `mandar_link_cita`, el último mensaje empieza con `p.config.agenda.link` |
| Agenda dentro del chat | Con `agendar` y `cita: { inicio: HORARIOS[0], nombre, correo }` contesta; con un horario inventado, `r.rechazo` habla de horarios |
| Pedidos | `resumir_pedido` con artículos reales del menú: `r.mensajes.at(-1)` trae `Total: $N`, con el N que **tú sumaste a mano**. Luego `cerrar_pedido`: `r.avisos[0]` empieza con `Pedido nuevo`. Con un artículo que no existe: `r.rechazo` dice que no está en el menú |
| Interesados | `registrar_interesado` sin un dato obligatorio: `r.rechazo` dice cuál falta. Con todos: `r.avisos[0]` empieza con `Interesado nuevo` y trae los datos |
| Enlaces | `mandar_link` con un link real de `conocimiento.md`: sale como último mensaje. Con uno inventado: `r.rechazo` |
| Link fijo | Con esa acción, el último mensaje es `p.config.acciones.<nombre>.link` |
| Precios | Con `"conocimiento"`: un precio inventado da `r.rechazo`. Con `"nunca"`: cualquier precio da `r.rechazo` |
| Pedidos, extras | Si hay tallas u opciones: sin `nota`, `r.rechazo` pide cuál. Si hay tope: arriba del tope, `r.rechazo` manda a `pasar_al_dueno` |
| Siempre | `pasar_al_dueno`: estado `"pasó al dueño"`, un aviso, y el siguiente turno da `"callado"`. `p.dueno(...)` calla; con la frase de regreso, retoma. `callarse`: estado `"se calló"` y cero mensajes |

Los campos de `p.dice`:
- Pedido: `{ pedido: { articulos: [{ nombre, cantidad, nota: null }], entrega: "recoger" }, datos: { nombre: "Ana" } }`
- Enlace: `{ enlace: "https://..." }`
- Cita dentro del chat: `{ cita: { inicio, nombre, correo } }`
- Datos: `{ datos: { nombre: "Ana" } }` (los que no pongas van en null)

Mira `test/pedidos.test.js` y `test/interesados-enlaces.test.js` si dudas de la forma.

## 6. Revisa antes de la parada

Corre los tres, en este orden, y lee lo que sale:

1. `npm test`: todo en verde. Si falla una prueba de `negocio.test.js`, el mensaje dice qué
   arreglar en `src/negocio/`. Si falla una de `mi-negocio.test.js`, primero revisa si el error
   está en tu prueba o en la configuración. Nunca arregles una prueba tocando `src/nucleo/`.
2. `npm run prompt`: lee el prompt completo como lo lee el bot. Revisa que ACCIONES tenga todas
   las del plan. Con pedidos, revisa "LO QUE SE PUEDE PEDIR" contra el menú que dio la persona,
   renglón por renglón: ahí no debe faltar ni sobrar nada. Con enlaces, lo mismo con los links.
3. `npm run pendientes`: la lista de lo que falta. Es normal que en este paso falten el ID de
   Zernio, el chat de Telegram y el `database_id`. No es normal que falte un dato del negocio
   que la persona sí te dio.

Última revisión, a mano: busca en `conocimiento.md` y en `prompt.js` cualquier cifra, horario,
dirección, teléfono, nombre o link, y confirma que cada uno salió de una respuesta de la
persona. Si encuentras uno que no, bórralo.
