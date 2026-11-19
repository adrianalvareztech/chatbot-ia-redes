# Fases en el simulador (paso 5) y subir (paso 6)

**Quién hace qué.** La persona puede no haber usado nunca una terminal. Todo lo que se pueda,
lo corres tú: `npm install`, `npm run db:local`, `npm run dev` (en segundo plano), las
pláticas con `--guion`, `npm test`, `npm run deploy`. A la persona le toca solo lo que nadie
más puede hacer: crear sus cuentas, escribir sus llaves en `.dev.vars` (dile que es un archivo
de texto y cómo abrirlo desde la barra lateral), correr con `!` los comandos que piden una
llave o iniciar sesión, y decir si lo que contestó el bot le gusta. Dale un paso a la vez y
espera a que diga "listo".

## Antes de la fase 1, una sola vez

1. Si todavía no tiene la llave de la API de Claude, guíala paso a paso: entra a
   console.anthropic.com, **API Keys** → **Create Key**, le pone un nombre y copia la llave
   (solo se ve una vez). En **Billing** carga saldo: con 5 dólares alcanza para probar. Esa
   llave se paga por uso, aparte de su plan de Claude. Espera a que diga "listo".
2. La persona copia `.dev.vars.example` como `.dev.vars` y deja `MODO=simulador`. Si no sabe
   cómo, hazlo tú (`cp .dev.vars.example .dev.vars`) y dile que lo abra en la barra lateral.
   Si en otra clase le dijeron que las llaves van en `.env`: aquí ese archivo se llama
   `.dev.vars`, es lo mismo.
3. En `.dev.vars` pone su llave de la API de Claude (`ANTHROPIC_API_KEY`) e inventa una frase
   larga para `ZERNIO_WEBHOOK_SECRET`. **Lo hace ella en el archivo, nunca en el chat.**
4. Corre `npm install` y `npm run db:local` (dile que les ponga `!` adelante, o córrelos tú).

El simulador usa dos terminales: en una `npm run dev` (el bot prendido en su compu) y en otra
`npm run simular` (el chat). No sale nada a ninguna red social. Si la persona no quiere abrir
terminales, tú prendes `npm run dev` en segundo plano y corres cada plática con
`npm run simular -- --guion test/guiones/<archivo>.txt`, y le enseñas lo que contestó el bot.

Con horario de pedidos, el simulador usa la hora real: fuera de ese horario el bot no toma
pedidos, y eso es lo correcto. Para probar a deshoras, pon `pedidos.horario: null` un momento
y regrésalo al terminar.

## Las fases

En `plan.md` van solo las que apliquen, numeradas de corrido. En cada una: qué se prepara, qué
se escribe en el simulador, qué debería pasar. No pases a la siguiente si la actual falló.

| Fase | Aplica si | Qué se prepara | Qué se prueba |
|---|---|---|---|
| **Contesta con lo que sabe** | Siempre | Nada más | Pregunta algo que sí sabe (un precio o un servicio real) y algo que no sabe. Lo que no sabe no lo inventa: pasa a una persona |
| **Memoria** | Siempre | Nada | Le dices un dato tuyo y luego preguntas otra cosa. `/estado` enseña lo que guardó |
| **Lo que sabe en Notion** | Notion | Ver "Pasar a Notion" abajo | Cambias un precio en Notion, esperas un momento y le preguntas ese precio |
| **Agenda** | Agenda | Con link: el link real en `config.js`. Dentro del chat: `CAL_API_KEY` en `.dev.vars` y el id del tipo de cita | Con link: pide agendar y llega el link. Dentro del chat: agenda y la cita aparece en el calendario |
| **Pedidos** | Pedidos | Nada más | `--guion test/guiones/camino-ideal.txt`: el resumen trae el total correcto. Luego pide algo que no está en el menú |
| **Interesados** | Interesados | Nada más | Da los datos poco a poco: el aviso sale hasta que están todos |
| **Enlaces y links fijos** | Enlaces o acciones con link | Los links reales en su lugar | Pide un producto o recurso: llega su link, y es el correcto |
| **Aviso, pase y silencio** | Siempre | `TELEGRAM_BOT_TOKEN` en `.dev.vars` (o `RESEND_API_KEY`), mandarle "hola" al bot de Telegram, `npm run telegram-chat` y poner el número en `aviso.telegram_chat` | Pide hablar con una persona: llega el aviso. `/dueno hola, yo te atiendo`: el bot se calla. `/regreso`: retoma |

Con pedidos o interesados, la fase de **Aviso** va antes que la de pedidos o interesados: sin
aviso no se ve llegar el pedido.

Al final, corre las pláticas completas una por una:
`npm run simular -- --guion test/guiones/camino-ideal.txt`

Si una respuesta sale mal: se agrega un caso o una regla a `prompt.js`, o se corrige
`conocimiento.md`, y se vuelve a probar. Después de cada cambio, `npm test`.

## Pasar a Notion

1. La persona crea la integración en notion.so/profile/integrations y pone el token en
   `.dev.vars` (`NOTION_TOKEN`).
2. Si ya lleva su lista en Notion, se usa esa misma página o base: no se crea otra. Revisa
   que tenga las columnas que el bot necesita y agrega solo lo que falte (las preguntas
   frecuentes pueden ir en una página aparte). Si no la tiene: crea una página en Notion y
   pega ahí el contenido de `src/negocio/conocimiento.md`.
   - Con pedidos: el menú va en una **tabla simple** o en una **base** con columnas `Nombre`
     (el título), `Precio` (número) y `Disponible` (casilla). Los nombres de las columnas van
     así, tal cual.
   - Con enlaces: cada link completo en su renglón.
   - Los cuadros grises (callouts) son notas para la persona: el bot no los lee.
3. Comparte la página con la integración: tres puntos → Connections. Si usa una base aparte,
   también se comparte.
4. Copia el id de la página (y el de cada base) a `config.js` → `notion.fuentes`, cambia
   `modulos.conocimiento` a `"notion"` y borra la nota `// PENDIENTE: cambiar a "notion"`.
5. `npm test` y reinicia `npm run dev`.
6. `src/negocio/conocimiento.md` se queda en el proyecto: lo usan las pruebas. Dile a la persona
   que desde hoy la información se cambia en Notion, y que el bot la toma en unos 10 minutos.

## Subir (paso 6)

Las llaves nunca se pegan en el chat. Tú das el comando; la persona lo corre con `!` adelante
y pega la llave cuando la terminal la pida. Paso por paso, esperando su confirmación:

**Si ya hay otro bot** en su Cloudflare o en su Zernio (lo dijo en el paso 1), antes de subir:
cambia `name = "chatbot"` en `wrangler.toml` por un nombre propio (`chatbot-<negocio>`), usa
ese mismo nombre en `npx wrangler d1 create` y en `database_name`, y en los scripts `db:local`
y `db:nube` de `package.json`. Si no, este bot se sube encima del otro. En Zernio, cada bot
recibe los mensajes de todas las cuentas conectadas y atiende solo las de su lista
(`zernio.cuentas`): revisa que el otro bot también tenga su lista, o va a contestar en la
cuenta nueva.

1. `npm run pendientes`. Lo que salga de datos del negocio se resuelve antes de seguir.
2. Cloudflare: `! npx wrangler login` y `! npx wrangler d1 create chatbot`. El `database_id`
   que salga va en `wrangler.toml`. Si usa notas de voz, descomenta `[ai]`.
3. Zernio: que conecte su cuenta y te diga el ID (en Zernio, Accounts). Va en `config.js` →
   `zernio.cuentas`. Cada red es una cuenta con su ID: con Instagram y WhatsApp son dos, y van
   los dos en la lista. Su llave de Zernio y el secreto del webhook van también en `.dev.vars`
   (`ZERNIO_API_KEY`, `ZERNIO_WEBHOOK_SECRET`): el paso 7 los lee de ahí.
4. Revisa que `wrangler.toml` diga `MODO = "solo-avisos"`.
5. Un comando por cada llave del plan: `! npx wrangler secret put NOMBRE`. No escribas ninguna
   llave en un archivo.
6. `npm run deploy`. Abre `/salud` en la dirección que dé: `faltan` tiene que salir vacío.
7. `! npm run webhook -- crear <la dirección del bot>`.
8. Sube el código a su repositorio privado de GitHub. Antes, revisa que `.dev.vars` no vaya.

**Primera vuelta, solo avisos.** Desde otra cuenta le escriben a la del negocio. El bot no
contesta: al dueño le llega lo que hubiera contestado. Se prueban los casos de `test/guiones/`
hasta que le guste. (En este modo un pedido no se puede cerrar, porque la persona nunca ve el
resumen: es normal.)

**Segunda vuelta, encendido.** `MODO = "encendido"` en `wrangler.toml` y `npm run deploy`. Le
escriben otra vez y el bot contesta. Luego el dueño contesta a mano desde la app: el bot ya no
se mete en esa plática.

Cierra diciéndole tres cosas:

- **Apagarlo:** `MODO = "apagado"` y `npm run deploy`.
- **Cambiar un precio o un dato:** en Notion, si lo usa; si no, en `src/negocio/conocimiento.md`
  y `npm run deploy`.
- **Cambiar cómo se porta:** primero el `PRD.md`, luego pedirle a Claude que actualice
  `src/negocio/` y volver a subir.
