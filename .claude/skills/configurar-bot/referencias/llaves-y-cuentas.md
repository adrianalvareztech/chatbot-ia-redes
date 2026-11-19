# Cuentas y llaves

En `plan.md` va **solo** lo que este bot necesita: lo de "Siempre" más lo de cada pieza
prendida. Copia los renglones que apliquen, con su "dónde se saca". Ni uno de más.

Una llave es una contraseña larga que un servicio te da para que el bot entre por ti. Nunca se
pega en el chat ni se sube a GitHub. En la compu va en `.dev.vars`; en la nube se guarda con
`npx wrangler secret put NOMBRE`.

## Siempre

| Qué | Para qué | Dónde se saca | Dónde va | Cuándo |
|---|---|---|---|---|
| Node.js 22.13 o más nuevo | Correr las pruebas y el simulador | nodejs.org | Se instala | Paso 4 |
| Llave de la API de Claude | El cerebro que contesta. Se paga por uso, aparte del plan de Claude; con 5 dólares de saldo alcanza para probar | console.anthropic.com → API Keys (y Billing para el saldo) | `.dev.vars`: `ANTHROPIC_API_KEY` | Paso 5, fase 1 |
| Secreto del webhook | Que el bot sepa que el mensaje viene de Zernio. No se saca de ningún lado: es una frase larga que inventa la persona | Se inventa | `.dev.vars`: `ZERNIO_WEBHOOK_SECRET` | Paso 5, fase 1 |
| Cuenta de Zernio con la red conectada | Recibir y mandar los mensajes. 10,000 mensajes al mes gratis | zernio.com → conectar la cuenta de Instagram, WhatsApp o Messenger | El ID de la cuenta va en `config.js` → `zernio.cuentas`. Cada red es una cuenta con su ID: dos canales, dos ID | Paso 6 |
| Llave de Zernio | Que el bot mande mensajes | zernio.com → dashboard → API Keys | `.dev.vars`: `ZERNIO_API_KEY` | Paso 6 |
| Cuenta de Cloudflare | Donde vive el bot. Gratis para empezar | dash.cloudflare.com. No hay llave que copiar: se entra con `npx wrangler login` | Nada | Paso 6 |
| Cuenta de GitHub (recomendado) | Guardar el código en un repositorio privado | github.com → New repository → Private | Nada | Paso 6 |

## Según el canal

| Canal | Qué hace falta |
|---|---|
| Instagram | Cuenta profesional (de empresa o de creador) ligada a una página de Facebook |
| Messenger | La página de Facebook del negocio |
| WhatsApp | Verificar el negocio con Meta. Tarda días: se empieza hoy. El número pasa a la API: si hoy es el WhatsApp normal de un celular, deja de usarse así. Con un número personal conviene sacar un número nuevo para el negocio, o arrancar solo con Instagram |

## Según la pieza prendida

| Pieza | Qué | Dónde se saca | Dónde va |
|---|---|---|---|
| Aviso por Telegram | Un bot de Telegram y su token | En Telegram, escribirle a @BotFather → `/newbot` | `.dev.vars`: `TELEGRAM_BOT_TOKEN` |
| Aviso por Telegram | El id del chat que recibe los avisos | Mandarle "hola" al bot nuevo y correr `npm run telegram-chat` | `config.js` → `aviso.telegram_chat` |
| Aviso por correo | Llave de Resend | resend.com → API Keys | `.dev.vars`: `RESEND_API_KEY` |
| Aviso por correo | El correo que recibe los avisos. Sin dominio propio, Resend solo manda al correo con que se abrió la cuenta de Resend | Lo dice el dueño | `config.js` → `aviso.correo` |
| Lo que sabe en Notion | Una integración de Notion y su token | notion.so/profile/integrations → New integration | `.dev.vars`: `NOTION_TOKEN` |
| Lo que sabe en Notion | Compartir la página o la base con la integración | En la página: tres puntos → Connections → elegir la integración. Aquí se atora casi todo mundo | Nada |
| Lo que sabe en Notion | El id de la página o de la base | Es la parte larga de letras y números del link de la página | `config.js` → `notion.fuentes` |
| Agenda con link | Cuenta de Cal.com y el link del tipo de cita | cal.com → Event Types → copiar el link | `config.js` → `agenda.link` |
| Agenda dentro del chat | Llave de Cal.com | app.cal.com → Settings → Developer → API Keys | `.dev.vars`: `CAL_API_KEY` |
| Agenda dentro del chat | El id del tipo de cita | Es el número al final del link cuando editas el tipo de cita en Cal.com | `config.js` → `agenda.tipo_de_cita` |
| Notas de voz | Nada que sacar | Se descomenta `[ai]` en `wrangler.toml` | `wrangler.toml` |
| Pedidos | Ninguna llave. Si cobra con link: el link de pago de su proveedor (Mercado Pago, Stripe, Clip) | Lo crea el dueño en su proveedor | `config.js` → `pedidos.pago.link` |
| Interesados | Ninguna llave | | |
| Enlaces | Ninguna llave. Los links van en "Lo que sabe" | | |
| Acción con link fijo | Ninguna llave. El link | Lo da el dueño | `config.js` → `acciones` |

## Cómo se escribe en `plan.md`

Una lista con casillas, en el orden en que se van a necesitar:

```
## Cuentas y llaves de este bot

Para probar en el simulador (paso 5):
- [ ] Llave de la API de Claude → console.anthropic.com → API Keys → va en .dev.vars
- [ ] Secreto del webhook → una frase larga inventada → va en .dev.vars
- [ ] Bot de Telegram → @BotFather → va en .dev.vars; el id del chat sale con npm run telegram-chat

Para subirlo (paso 6):
- [ ] Zernio con el Instagram conectado → zernio.com
- [ ] Llave de Zernio → dashboard → API Keys
- [ ] Cuenta de Cloudflare → dash.cloudflare.com
- [ ] Repositorio privado en GitHub

No necesita: Notion, llave de Cal.com, Resend.
```

La última línea ("No necesita") se escribe siempre: le ahorra a la persona sacar llaves de más.

Marca con `[x]` las cuentas que la persona dijo que ya tiene (pregunta 5 del paso 1).

Si el negocio es de un cliente, agrega una columna "quién la saca": casi todas las cuentas
tienen que ser del cliente (su Instagram, su Zernio, su Cal.com), para que el bot siga siendo
suyo si cambia de proveedor.
