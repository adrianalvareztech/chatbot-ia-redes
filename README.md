# Chatbot con IA para Instagram, WhatsApp y Messenger

Plantilla para construir con Claude Code un chatbot que contesta los mensajes de tu negocio
(o del negocio de tu cliente), sabe lo que vende, agenda citas, toma pedidos, junta los datos
de un interesado y te avisa cuando una persona tiene que entrar.

Ya trae el motor hecho y probado: recibe los mensajes, recuerda cada plática, se calla cuando
tú contestas y frena lo que el bot invente. Lo que cambia de un negocio a otro (qué sabe, cómo
habla, qué piezas usa) lo escribe Claude Code contigo, paso por paso: te entrevista y deja el
bot configurado para tu negocio.

## Para qué negocios sirve

| Tipo de bot | Ejemplos | Qué logra |
|---|---|---|
| Citas | dentista, estética, barbería, veterinaria | Que la persona agende |
| Pedidos | café, taquería, pastelería | Arma la orden, da el total y le avisa a cocina |
| Tienda | ropa, cosméticos, artesanías | Cierra el pedido o manda el link del producto |
| Catálogo que califica | inmobiliaria, autos, viajes | Entiende qué busca y le pasa los datos a un asesor |
| Agencia o consultoría | agencia, despacho, consultor | Platica, ve si es tu cliente y agenda la llamada |
| Creador o marca personal | creador, comunidad, curso | Manda el recurso y lleva a tu comunidad |
| Cursos y clases | academia, escuela, talleres | Recomienda un curso e inscribe |
| Cotizaciones | contratista, eventos, imprenta | Junta lo necesario para cotizar y te lo pasa |

## Qué necesitas

| Servicio | Para qué | Costo |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | Construir el bot | Tu plan de Claude |
| [API de Claude](https://console.anthropic.com) | El cerebro que contesta | Pagas por uso |
| [Zernio](https://zernio.link/h4rBqIR) | Conectar tus redes | 10,000 mensajes al mes gratis |
| [Cloudflare](https://dash.cloudflare.com) | Donde vive el bot, 24/7 | Gratis para empezar |
| [Notion](https://www.notion.so) | Lo que el bot sabe, si lo quieres editar ahí (opcional) | Gratis |
| [Cal.com](https://cal.com) | Agendar citas (opcional) | Gratis |
| [Telegram](https://telegram.org) | El aviso cuando el bot te pasa una plática (o por correo) | Gratis |
| [GitHub](https://github.com) | Guardar el código | Gratis |
| [Node.js](https://nodejs.org) 22.13 o más nuevo | Correr las pruebas y el simulador en tu compu | Gratis |

Si vas a usar WhatsApp, Meta te pide verificar tu negocio y puede tardar días. Empieza ese
trámite hoy, aunque arranques con Instagram.

## Cómo se usa

1. Crea una carpeta vacía, ábrela con Claude Code y pégale esto:

   ```
   Descarga la plantilla de https://github.com/adrianalvareztech/chatbot-ia-redes directamente
   en esta carpeta, sin crear una subcarpeta. Cuando termine, dime qué archivos bajaste.
   ```

   Si prefieres hacerlo a mano: botón verde **Code**, luego **Download ZIP**, y abre la
   carpeta con Claude Code.
2. Cierra Claude Code y ábrelo otra vez en la misma carpeta, para que reconozca la skill que
   acabas de bajar. Luego escribe esto:

   ```
   /configurar-bot
   ```

   Claude te hace una pregunta a la vez y avanza en seis pasos. Al final de cada uno se
   detiene, te enseña lo que hizo y espera a que escribas **sigue**.

| Paso | Qué pasa | Qué queda escrito |
|---|---|---|
| 1. Contexto | Le dices qué negocio es y qué quieres que logre el bot | `CLAUDE.md`, sección "El negocio" |
| 2. PRD | Te entrevista: qué sabe el bot, cómo habla, qué nunca hace, cuándo entras tú | `PRD.md` |
| 3. Plan | Decide qué piezas se prenden y qué cuentas y llaves necesitas. Tú lo revisas | `plan.md` |
| 4. El bot | Escribe sus instrucciones, lo que sabe y sus piezas. Corre las pruebas | `src/negocio/` y `test/guiones/` |
| 5. Fases | Pruebas cada pieza en un chat de prueba, sin conectar tu cuenta | Ajustes |
| 6. Subir | Se sube a la nube en modo prueba y se conecta a tu cuenta real | El bot prendido |

Puedes cerrar Claude Code y volver otro día: `/configurar-bot` retoma donde te quedaste. Para
hacer el bot de otro negocio: copia la carpeta y escribe `/configurar-bot otro negocio`.

**Si prefieres ir a mano**, los mismos pasos están como prompts para copiar y pegar en
`prompts/`, del `01` al `07`.

## Qué hay aquí

Este repositorio sirve para **construir** el bot. El bot que vive en la nube solo se lleva
el código (`src/`), su configuración (`wrangler.toml`) y tus llaves. Lo demás lo lee Claude
Code mientras construye, y el bot nunca lo ve.

| Archivo o carpeta | Para qué es | ¿Sube a la nube? |
|---|---|---|
| `README.md` | Esto que estás leyendo | No |
| `CLAUDE.md` | Las instrucciones que Claude Code lee cada vez que abre el proyecto | No |
| `plantillas/plantilla-prd.md` | La estructura del PRD. La llena Claude entrevistándote | No |
| `plantillas/plantilla-prompt-bot.md` | Las 7 partes de un buen prompt para el bot | No |
| `.claude/skills/configurar-bot/` | La skill que te entrevista y configura el bot. Trae las preguntas de cada tipo de negocio | No |
| `prompts/` | Los mismos pasos a mano, para copiar y pegar | No |
| `PRD.md` y `plan.md` | Tu negocio y el plan. Los escribe Claude (todavía no existen) | No |
| `src/index.js` | La puerta: recibe los mensajes de Zernio | Sí |
| `src/nucleo/` | Lo que todo bot necesita: recibir, recordar, callarse cuando contestas tú, frenar lo inventado. No se toca | Sí |
| `src/modulos/` | Piezas que se prenden según tu PRD: lo que sabe (archivo o Notion), agenda, aviso, notas de voz, pedidos, interesados y enlaces. `LEEME.md` explica cómo se arma una nueva | Sí |
| `src/negocio/` | Tu bot: `config.js` (qué piezas usa), `prompt.js` (cómo habla) y `conocimiento.md` (lo que sabe). Trae el ejemplo de una clínica dental que Claude reemplaza | Sí |
| `migrations/` | Cómo se arma la memoria del bot (la base de datos D1) | Sí |
| `wrangler.toml` | La configuración para Cloudflare | Sí |
| `package.json` | Los comandos (`npm test`, `npm run simular`...) y la única librería que usa | Sí |
| `scripts/` | `ver-prompt.mjs` enseña el prompt completo; `pendientes.mjs` dice qué dato falta; `telegram-chat.mjs` te da el id de tu chat; `webhook.mjs` conecta Zernio con el bot | No |
| `test/` | Las pruebas (`npm test`), las pláticas de prueba de tu negocio (`test/guiones/` y `test/mi-negocio.test.js`) y el simulador de chat (`npm run simular`) | No |
| `.dev.vars.example` | La lista de llaves. Cópialo como `.dev.vars` y llénalo | No |
| `.dev.vars` | Tus llaves en tu compu. Nunca va a GitHub | No (en la nube van como secrets) |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala lo necesario (una vez) |
| `npm test` | Corre las pruebas. Tienen que salir todas bien antes de subir |
| `npm run db:local` | Prepara la memoria del bot en tu compu (una vez) |
| `npm run dev` | Prende el bot en tu compu |
| `npm run simular` | Chateas con el bot en la terminal (con `npm run dev` corriendo) |
| `npm run prompt` | Enseña el prompt completo, tal como lo lee el bot. Con pedidos, también lo que se puede pedir y a qué precio |
| `npm run pendientes` | Lista los datos y las llaves que faltan para poder subir |
| `npm run telegram-chat` | Te dice el id de tu chat de Telegram, para los avisos |
| `npm run deploy` | Prueba, revisa que no falte ningún dato, prepara la memoria en la nube y sube el bot |
| `npm run webhook -- crear <url>` | Conecta Zernio con el bot ya subido |

## Tres reglas que no se rompen

- **Las llaves no se suben a GitHub ni se pegan en el chat.**
- **Cuando tú contestas a mano, el bot se calla.** Si no, le contesta encima a tu cliente.
- **El bot no inventa.** Un precio, un total, un horario o un link que no está en "Lo que sabe"
  no sale: lo frena el código, no solo las instrucciones.

## Lo que no hace (todavía)

Solo contesta: no escribe primero ni da seguimiento. Manda texto y links, no fotos. No entiende
fotos (si le mandan un comprobante, te avisa). No cobra dentro del chat: manda tu link de pago.
No lleva inventario: lo que se acabó se marca a mano. No contesta comentarios de publicaciones.
