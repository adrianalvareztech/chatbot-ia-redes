# Chatbot con IA para redes

Chatbot que contesta los mensajes de Instagram, WhatsApp o Messenger de un negocio. Corre en
Cloudflare Workers, recibe y manda por Zernio, y contesta con la API de Claude.

## El negocio

> Lo llena la skill `/configurar-bot` en su paso 1. Mientras diga [pendiente], el bot no está
> configurado: corre `/configurar-bot` o pregunta antes de suponer.

- **Negocio:** [pendiente]
- **A qué se dedica:** [pendiente]
- **De quién es:** [pendiente]
- **Canales:** [pendiente]
- **Tipo de bot:** [pendiente]
- **Meta del bot:** [pendiente]

## Dónde va cada cosa

- `src/nucleo/`: recibir, recordar, callarse cuando el dueño contesta, frenar lo inventado.
  **No se edita.** Si crees que tiene un bug, dilo y enseña la prueba que falla antes de tocarlo.
- `src/modulos/`: piezas que se prenden desde `src/negocio/config.js`: lo que sabe, agenda,
  aviso, voz, pedidos, interesados y enlaces. Una nueva sigue el contrato de `src/modulos/LEEME.md`.
- `src/negocio/`: lo único que escribes tú. `config.js`, `prompt.js` y `conocimiento.md`.
- `PRD.md` manda. Si lo que te piden lo contradice, propón cambiar el PRD primero.
- `.claude/skills/configurar-bot/`: la entrevista y las reglas para escribir todo lo anterior.
  Si el usuario pide configurar, empezar, seguir o adaptar el bot, usa esa skill.

## Cómo trabajamos

1. Plan antes que código: `plan.md` dice qué se prende y en qué orden. Una fase a la vez.
2. Al terminar una fase corre `npm test`, di cómo se prueba con `npm run simular` y espera
   el visto bueno.
3. Nada se inventa. Si falta un precio, un horario o un ID, pregúntalo. Si nadie lo sabe hoy,
   se marca `PENDIENTE` y `npm run pendientes` lo recuerda.
4. Precios, servicios y links van en el conocimiento, nunca en `prompt.js`.
5. Un total, una suma o un link nunca los escribe el bot: los pone el código (pedidos, enlaces).
6. Explica en simple: quien usa esto puede no ser programador.

## Llaves

- En local van en `.dev.vars`. En la nube, `npx wrangler secret put NOMBRE`, y lo corre el
  usuario. Nunca en un archivo que sube a GitHub, nunca en el chat.
- Si ves una llave pegada en el chat o en el código, avisa para que se revoque.

## Antes de prender

- `npm run prompt` enseña el prompt completo, lo que se puede pedir y los links que puede mandar.
  `npm run simular` es el chat de prueba. `npm run pendientes` dice qué dato falta.
- El primer deploy va con `MODO = "solo-avisos"`: el bot no manda nada y le avisa al dueño
  qué contestaría. Se pasa a `encendido` cuando el dueño lo aprueba.
- La prueba final tiene dos partes: el bot contesta, y se calla cuando el dueño contesta a mano.
