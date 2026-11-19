---
name: configurar-bot
description: Configura el chatbot de esta plantilla para un negocio concreto, paso por paso. Entrevista al dueño con una pregunta a la vez, reconoce qué tipo de bot necesita (citas, pedidos, tienda, catálogo que califica, agencia, creador, cursos, cotizaciones u otro que no se parezca a ninguno) y escribe CLAUDE.md, PRD.md, plan.md, src/negocio/ (config.js, prompt.js, conocimiento.md), las pláticas de prueba y la lista exacta de cuentas y llaves. Úsala cuando el usuario diga "configura mi bot", "configurar bot", "empezar", "empecemos", "comenzar", "quiero mi chatbot", "arma mi bot", "adapta el bot a mi negocio", "hazlo para otro negocio", "sigue con mi bot" o escriba /configurar-bot. También cuando abra el proyecto recién descargado y pregunte qué sigue.
---

# Configurar el bot

Llevas a una persona, que puede no saber programar, desde la plantilla recién descargada hasta
su bot contestando en la nube. Son seis pasos y al final de cada uno hay una parada.

```
1. Contexto → 2. PRD → 3. Plan → 4. El bot (prompt, lo que sabe, piezas) → 5. Fases en el simulador → 6. Subir
```

## Reglas que no se rompen

1. **Una pregunta a la vez.** Preguntas, esperas la respuesta y sigues. Nunca mandes una lista
   de preguntas. Si la respuesta es vaga, pide un ejemplo real ("¿cómo te lo escriben?").
2. **Nada se inventa.** Ni un precio, ni un horario, ni una dirección, ni un link, ni un ID. Si
   la persona no lo sabe, se anota como pendiente (ver "Pendientes" abajo) y se sigue.
3. **Lo que la persona ya dijo no se vuelve a preguntar.** Si pegó su menú o su lista de
   precios, léela y solo confirma lo que no quede claro.
4. **Parada al final de cada paso.** Escribes el bloque de parada y esperas a que diga "sigue".
   No empieces el paso siguiente en el mismo mensaje, aunque sea corto. Solo te saltas las
   paradas si la persona lo pide con esas palabras ("sin paradas").
5. **Español simple.** Frases cortas, de tú, sin tecnicismos. Si usas una palabra técnica
   (webhook, deploy), explícala en media línea la primera vez.
6. **`src/nucleo/` no se toca.** Si algo del negocio no lo cubre ninguna pieza, lo dices en
   el plan antes de proponer código nuevo.
7. **Las llaves nunca van en el chat ni en un archivo que sube a GitHub.** Van en `.dev.vars`
   (las escribe la persona) o con `npx wrangler secret put` (lo corre la persona con `!`).
8. **Tú propones, la persona decide.** En los ajustes técnicos (cuánto espera, cuántas horas se
   calla) enseñas el valor recomendado y preguntas si lo cambia. En los datos del negocio no
   propones nada: preguntas.

## Antes de empezar: en qué paso vamos

Revisa los archivos y retoma donde se quedó. Dile a la persona en una línea dónde van.

| Qué encuentras | Vas en |
|---|---|
| `CLAUDE.md` dice `[pendiente]` en "El negocio" | Paso 1 |
| "El negocio" lleno y no existe `PRD.md` | Paso 2 |
| Existe `PRD.md` y no existe `plan.md` | Paso 3 |
| Existe `plan.md` y `src/negocio/config.js` sigue con "Clínica Sonrisa" | Paso 4 |
| `src/negocio/` ya es del negocio y `wrangler.toml` dice `PEGA_AQUI_EL_ID` | Paso 5 |
| `wrangler.toml` ya tiene su `database_id` | Paso 6 |

Si la persona pide un paso concreto ("vamos al plan"), ve a ese paso. Si pide "otro negocio",
lee la sección "Otro negocio" al final.

## Paso 1 · Contexto

Lee `CLAUDE.md`, `README.md` y `referencias/tipos-de-bot.md`. Luego pregunta, de una en una:

1. ¿Cómo se llama el negocio y a qué se dedica? (Si ya lo dijo al invocar la skill, sáltala.)
2. ¿El negocio es tuyo o es de un cliente al que le vas a instalar el bot?
3. Cuando alguien les escribe por mensaje, ¿qué quieres que pase al final de la plática?
   Dale las opciones de la tabla de `referencias/tipos-de-bot.md` en palabras simples, más
   la opción "otro". Que conteste con sus palabras si ninguna le queda: entonces es tipo Otro
   (`referencias/tipo-otro.md`), y su negocio se arma igual.
4. ¿Por dónde les escriben: Instagram, WhatsApp, Messenger?
5. ¿Qué cuentas ya tienes de estas: Zernio, Cloudflare, llave de la API de Claude, Notion,
   Cal.com, Telegram? ¿Hay ya otro bot conectado en ese Zernio o en esa cuenta de Cloudflare?
   (Si el negocio es de un cliente: cuáles tiene el cliente y cuáles tú.) Va a `plan.md`.

Con eso eliges **un** tipo de bot. Si dudas entre dos, pregunta lo que los separa (la tabla
dice qué preguntar). Dile cuál elegiste y por qué, en dos líneas, y espera su "sí".

Escribe en `CLAUDE.md`, sección "El negocio": negocio, a qué se dedica, de quién es, canales,
tipo de bot y la meta del bot en una frase. No toques el resto del archivo.

No escribas código todavía.

> **PARADA 1 de 6 · Contexto.** Di qué anotaste, qué tipo de bot es y qué se va a decidir en
> el PRD. Si eligió WhatsApp, dile dos cosas: Meta pide verificar el negocio y tarda días, así
> que ese trámite se empieza hoy; y un número que hoy se usa en el celular como WhatsApp normal
> deja de usarse así cuando pasa a la API. Recomiéndale arrancar con Instagram o Messenger y
> sumar WhatsApp después. Termina con: "Escribe **sigue** y te entrevisto para el PRD."

## Paso 2 · El PRD

Lee `plantillas/plantilla-prd.md`, `referencias/preguntas-comunes.md` y el archivo de preguntas
del tipo elegido (`referencias/tipo-<nombre>.md`).

Antes de la primera pregunta, dile que son entre 20 y 28 preguntas cortas y que puede pegar
documentos que ya tenga (menú, lista de precios, preguntas frecuentes, su sitio) para ahorrarse preguntas.

Entrevista en el orden de `preguntas-comunes.md`, metiendo las preguntas del tipo donde ese
archivo dice. Salta lo ya contestado. Cuando un dato no lo sabe, anótalo como pendiente y sigue.

Al terminar, guarda `PRD.md` con la estructura de la plantilla, completa: ninguna sección se
borra; la que no aplica dice "No aplica". Lo que quedó pendiente se escribe como
`PENDIENTE: qué falta y quién lo tiene`.

> **PARADA 2 de 6 · PRD.** Enseña un resumen de 6 a 8 líneas del PRD (objetivo, qué sabe, qué
> puede hacer, qué nunca hace, cuándo pasa a una persona), la lista de pendientes y las
> secciones que quedaron flojas. Termina con: "Revísalo. Si algo no es así, dímelo y lo
> corrijo. Escribe **sigue** para el plan."

## Paso 3 · El plan

Lee `PRD.md`, `src/modulos/LEEME.md`, `src/negocio/config.js`, el archivo del tipo,
`referencias/llaves-y-cuentas.md` y `referencias/fases.md`. Escribe `plan.md` con estas secciones, en este orden:

1. **Qué hace este bot**, en dos líneas.
2. **Piezas que se prenden** (tabla: pieza, valor, por qué). Usa lo recomendado en el archivo
   del tipo, ajustado a lo que dijo la persona. Una pieza que el PRD no pide se queda apagada.
3. **`config.js`, valor por valor.** Todos los valores que van a cambiar.
4. **Lo que el PRD pide y ninguna pieza cubre.** Compáralo con "Lo que esta plantilla no
   hace" de `tipos-de-bot.md`. Si hay algo, dilo claro y di qué se hace mientras tanto. No
   propongas código nuevo sin que te lo pidan.
5. **Datos que faltan** y quién los tiene que dar.
6. **Cuentas y llaves que necesita este bot.** Solo las de las piezas prendidas, con dónde se
   saca cada una (de `llaves-y-cuentas.md`). Ni una de más. Marca las que ya tiene (pregunta 5
   del paso 1). Si ya hay otro bot en su Zernio o en su Cloudflare, escribe aquí el aviso de
   "Si ya hay otro bot" de `fases.md`.
7. **Fases**, y qué plática de prueba se corre en cada una (de `referencias/fases.md`).

No escribas código todavía.

> **PARADA 3 de 6 · Plan.** Resume las piezas prendidas y las llaves. Pídele que revise tres
> cosas: 1) ¿cada cosa que hace el bot en el PRD tiene su pieza?, 2) ¿dice cuántas horas se
> calla cuando contesta él y cuál es la frase para regresarle la plática?, 3) ¿cada fase dice
> qué se prueba? Termina con: "Escribe **sigue** y escribo el bot."

## Paso 4 · El bot: su prompt, lo que sabe y sus piezas

Lee `referencias/como-escribir-el-negocio.md` y síguelo al pie de la letra. Escribes:

1. `src/negocio/conocimiento.md`: lo que sabe, solo con lo que dijo la persona.
2. `src/negocio/config.js`: mismos campos y comentarios, valores del plan.
3. `src/negocio/prompt.js`: partes 1 a 6 de `plantillas/plantilla-prompt-bot.md`.
4. `test/guiones/*.txt`: las pláticas de prueba del archivo del tipo, más la prueba propia de
   la persona. Salen de 4 a 6.
5. `test/mi-negocio.test.js`: las mismas pláticas, para probar sin llaves.

Si no existe la carpeta `node_modules`, corre primero `npm install` (tarda un par de minutos).
Luego corre `npm test`, `npm run prompt` y `npm run pendientes`. Si `npm test` falla, lee el
mensaje, corrige `src/negocio/` y vuelve a correr. No sigas con pruebas en rojo.

> **PARADA 4 de 6 · El bot.** Enseña el prompt en español normal, parte por parte (quién es,
> su meta, el camino, cómo escribe, lo que nunca hace, los casos). Di qué decidiste tú que no
> estaba en el PRD. Enseña la lista de pendientes. Pídele que revise: 1) ¿la meta es una
> sola?, 2) ¿cada caso de "cuándo pasa a una persona" está en el prompt?, 3) ¿suena a su
> negocio? Termina con: "Escribe **sigue** para probarlo en el simulador."

## Paso 5 · Fases en el simulador

Lee `referencias/fases.md`. Una fase a la vez: preparas lo que haga falta, dices qué escribir
en el simulador y qué debería pasar, y esperas su visto bueno antes de la siguiente.

> **PARADA 5 de 6 · Fases.** Cuando pasaron todas: lista de fases con su resultado y lo que
> se ajustó. Termina con: "Escribe **sigue** para subirlo a la nube."

## Paso 6 · Subirlo y conectarlo

Sigue "Subir" de `referencias/fases.md`. Va en dos vueltas: primero `solo-avisos` (el bot no
manda nada y le avisa al dueño qué contestaría) y después `encendido`.

> **PARADA 6 de 6 · En la nube.** Di en qué modo quedó, cómo se apaga, cómo se cambia un
> precio y qué quedó fuera de esta versión.

## Pendientes

Lo que la persona no sabe hoy no se inventa y no frena la entrevista. Hay dos clases:

**Sin este dato el bot no funciona** (el link de la agenda, el ID de Zernio, el chat de Telegram,
el link de un recurso que es la meta del bot). Frena la subida.

- En `config.js`: el valor lleva la palabra `PENDIENTE` (un link: `"https://PENDIENTE"`).
- `npm run deploy` no sube mientras quede uno.

**El bot funciona sin este dato** (una pregunta frecuente sin respuesta, en cuánto tiempo
contacta el asesor, si tienen licencia). No frena: si alguien lo pregunta, el bot pasa la plática.

- En `conocimiento.md` el dato no se escribe. Va como nota que el bot no lee:
  `<!-- PENDIENTE: en cuánto tiempo contacta el asesor -->`.
- `npm run pendientes` lo enseña en "Ojo", sin frenar.

En los dos casos, en `PRD.md` y `plan.md` se anota `PENDIENTE: qué falta y quién lo tiene`.

Un texto que le llega al cliente (las frases de pase, cómo se paga) nunca lleva la palabra
PENDIENTE. Se escribe solo con lo que sí se sabe.

Para soltar un pendiente: cuando la persona da el dato, se escribe en su lugar y se borra la
nota. Si decide que no lo va a dar, se borra la nota y listo.

## Otro negocio

El mismo bot para otro negocio se hace en una copia de la carpeta, para no tocar el que ya
funciona. En la copia: borra `PRD.md` y `plan.md`, regresa "El negocio" de `CLAUDE.md` a
`[pendiente]` y empieza en el paso 1. Solo cambia `src/negocio/`, `test/guiones/`,
`test/mi-negocio.test.js`, `wrangler.toml` (otro `name` y otro `database_id`) y las llaves.

## Archivos de referencia

| Archivo | Cuándo lo lees |
|---|---|
| `referencias/tipos-de-bot.md` | Paso 1: elegir el tipo. Paso 3: lo que la plantilla no hace |
| `referencias/preguntas-comunes.md` | Paso 2: el orden de la entrevista |
| `referencias/tipo-citas.md`, `tipo-pedidos.md`, `tipo-tienda.md`, `tipo-catalogo.md`, `tipo-agencia.md`, `tipo-creador.md`, `tipo-cursos.md`, `tipo-cotizaciones.md`, `tipo-otro.md` | Pasos 2, 3 y 4: solo el del tipo elegido |
| `referencias/llaves-y-cuentas.md` | Paso 3: la lista de cuentas y llaves |
| `referencias/como-escribir-el-negocio.md` | Paso 4 |
| `referencias/fases.md` | Pasos 5 y 6 |
