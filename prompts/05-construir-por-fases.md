# Prompt 05 · Prender y probar por fases

> Este es el camino a mano. La skill `/configurar-bot` hace este mismo paso contigo: te
> pregunta, escribe y se detiene para que revises.

Aquí no se escribe el motor: ya viene hecho. Cada fase prende una pieza y la prueba en el
simulador, sin conectar tu cuenta real.

Antes de la fase 1, una sola vez: copia `.dev.vars.example` como `.dev.vars`, deja
`MODO=simulador`, pon tu llave de la API de Claude e inventa un `ZERNIO_WEBHOOK_SECRET`.
Luego corre `npm install` y `npm run db:local`.

Usa este prompt para la fase 1. Para cada fase siguiente, cambia el número.

```
Haz la fase 1 de plan.md. Al terminar corre npm test, dime cómo la pruebo con npm run simular
(qué escribo y qué debería pasar) y espera mi visto bueno antes de seguir.
```

**Las fases, más o menos:**

1. **Chat con lo que sabe en archivo.** `conocimiento.md` con tu negocio. En una terminal
   `npm run dev`, en otra `npm run simular`. Pregúntale un precio y algo que no sabe.
2. **Memoria.** Ya funciona: dile tu nombre y en el siguiente mensaje pregúntale si se acuerda.
   `/estado` enseña lo que guardó.
3. **Notion** (si lo elegiste). Cambia un precio en Notion y pregúntale al bot.
4. **Agenda.** Con link: pide agendar y revisa que mande tu link. Dentro del chat: agenda y
   revisa que la cita aparezca en tu calendario.
5. **Aviso, pase y silencio.** Pide hablar con una persona: te tiene que llegar el aviso.
   Escribe `/dueno hola, yo te atiendo` y el bot se calla. Escribe `/regreso` y el bot retoma.
   Para el aviso por Telegram: pon el token de tu bot en `.dev.vars`, mándale "hola" a tu bot y
   corre `npm run telegram-chat` para saber el id de tu chat.
6. **Pedidos, interesados o enlaces** (si los prendiste). Pedidos: pide dos cosas del menú y
   revisa el total del resumen; luego pide algo que no existe. Interesados: da tus datos poco
   a poco y revisa que el aviso llegue hasta que están todos. Enlaces: pide un producto y
   revisa que el link sea el correcto.

No pases a la siguiente fase si la prueba de la actual falló. Cuando estén todas,
`npm run simular -- --guion test/guiones/camino-ideal.txt` corre la plática completa.
