# Chatbot con IA para Instagram, WhatsApp y Messenger

Plantilla para construir con Claude Code un chatbot que contesta los mensajes de tu negocio
(o del negocio de tu cliente), sabe lo que vende, agenda citas y te avisa cuando una
persona tiene que entrar.

Ya trae el motor hecho y probado: recibe los mensajes, recuerda cada plática, se calla cuando
tú contestas y frena lo que el bot invente. Lo que cambia de un negocio a otro (qué sabe, cómo
habla, qué piezas usa) lo escribe Claude Code contigo, paso por paso, a partir de un documento
que describe tu negocio: el PRD.

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
   Descarga en esta carpeta la plantilla de https://github.com/adrianalvareztech/chatbot-ia-redes
   ```

   Si prefieres hacerlo a mano: botón verde **Code**, luego **Download ZIP**, y abre la
   carpeta con Claude Code.
2. Corre los prompts de `prompts/` en orden, uno por uno:

| Prompt | Qué pasa |
|---|---|
| `01-contexto.md` | Claude entiende tu negocio y el proyecto |
| `02-entrevista-prd.md` | Claude te entrevista y escribe tu `PRD.md` |
| `03-plan-tecnico.md` | Claude escribe en `plan.md` qué piezas se prenden y en qué orden. Tú lo revisas |
| `04-prompt-del-bot.md` | Claude escribe las instrucciones que el bot lee en cada mensaje |
| `05-construir-por-fases.md` | Se prende una pieza, se prueba en el simulador, y sigue la otra |
| `06-subir-y-conectar.md` | Se sube a la nube en modo prueba y se conecta a tu cuenta real |
| `07-otro-negocio.md` | El mismo bot, adaptado a otro negocio |

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
| `prompts/` | Los siete pasos en orden, para copiar y pegar | No |
| `PRD.md` y `plan.md` | Tu negocio y el plan. Los escribe Claude (todavía no existen) | No |
| `src/index.js` | La puerta: recibe los mensajes de Zernio | Sí |
| `src/nucleo/` | Lo que todo bot necesita: recibir, recordar, callarse cuando contestas tú, frenar lo inventado. No se toca | Sí |
| `src/modulos/` | Piezas que se prenden según tu PRD: lo que sabe (archivo o Notion), agenda, aviso y notas de voz. `LEEME.md` explica cómo se arma uno nuevo | Sí |
| `src/negocio/` | Tu bot: `config.js` (qué piezas usa), `prompt.js` (cómo habla) y `conocimiento.md` (lo que sabe). Trae el ejemplo de una clínica dental que Claude reemplaza | Sí |
| `migrations/` | Cómo se arma la memoria del bot (la base de datos D1) | Sí |
| `wrangler.toml` | La configuración para Cloudflare | Sí |
| `package.json` | Los comandos (`npm test`, `npm run simular`...) y la única librería que usa | Sí |
| `scripts/` | `ver-prompt.mjs` enseña el prompt completo; `webhook.mjs` conecta Zernio con el bot | No |
| `test/` | Las pruebas (`npm test`) y el simulador de chat (`npm run simular`) | No |
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
| `npm run prompt` | Enseña el prompt completo, tal como lo lee el bot |
| `npm run deploy` | Prueba, prepara la memoria en la nube y sube el bot |
| `npm run webhook -- crear <url>` | Conecta Zernio con el bot ya subido |

## Dos reglas que no se rompen

- **Las llaves no se suben a GitHub ni se pegan en el chat.**
- **Cuando tú contestas a mano, el bot se calla.** Si no, le contesta encima a tu cliente.
