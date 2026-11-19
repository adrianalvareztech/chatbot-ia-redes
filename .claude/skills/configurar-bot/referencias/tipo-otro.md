# Tipo · Otro

Para el negocio que no cabe en ninguno de los ocho: un gimnasio con membresías, una
veterinaria con hotel, una lavandería, un despacho que solo contesta dudas, una iglesia, una
asociación. No se fuerza a un tipo. Se arma el bot con las mismas piezas, a partir de lo que
la persona cuente.

**Meta del bot:** la que diga la persona, en sus palabras, convertida en **una** acción.

## Cómo encontrar la meta

Pregunta, de una en una:

1. "Piensa en la mejor plática que has tenido por mensaje con un cliente. ¿Cómo empezó y cómo
   terminó?" [De aquí sale el camino del prompt.]
2. "Al final de esa plática, ¿qué hizo la persona o qué hiciste tú?" [De aquí sale la meta.]
3. "¿Qué te preguntan más seguido por mensaje? Dime las cinco preguntas que más se repiten."
   [Van a `conocimiento.md`, con la respuesta que la persona dé a cada una.]

Con la respuesta 2, elige la pieza que la cumple. Si ninguna la cumple completa, la más
cercana, y lo que falte se resuelve pasando la plática al dueño:

| Si al final... | Pieza | En `config.js` |
|---|---|---|
| La persona aparta una hora o una fecha | Agenda con link | `agenda: "link"` |
| La persona pide algo con precio y tú lo preparas o lo entregas | Pedidos | `pedidos: true` |
| La persona compra o se registra en una página | Enlaces o link fijo | `enlaces: true` |
| Tú necesitas sus datos para atenderla tú | Interesados | `interesados: true` |
| Solo quería una respuesta | Ninguna: contesta con lo que sabe y cierra | todas apagadas |
| Algo que solo puede resolver una persona | Pasar la plática al dueño | `aviso` |

Dile a la persona en una línea qué pieza elegiste y por qué, con sus palabras: "Tu bot va a
juntar el nombre, la mascota y las fechas, y te los manda para que tú confirmes el hotel".
Pregunta si así le sirve antes de seguir.

## Preguntas de "Lo que sabe" (bloque E)

4. "¿Qué ofreces, con sus precios, tal como se los dices a un cliente?" [`conocimiento.md`.
   Si no quiere que el bot diga precios: `revisor.precios: "nunca"`.]
5. "¿Horario, dirección y formas de pago?" [`conocimiento.md`, solo lo que diga.]
6. "¿Hay algo que la gente cree que haces y no haces?" [`conocimiento.md`, sección "Lo que no
   hacemos".]

## Preguntas de "Lo que puede hacer" (bloque F)

7. Las de la pieza elegida, del archivo de ese tipo:
   - Agenda: preguntas de agenda de `tipo-citas.md`.
   - Pedidos: preguntas de pedido de `tipo-pedidos.md`.
   - Enlaces: preguntas de links de `tipo-tienda.md`.
   - Interesados: pregunta 7 de `tipo-cotizaciones.md` (qué datos necesitas, de 3 a 5).

## Lo que nunca hace y cuándo pasa a una persona (bloques G y H)

Usa las listas de `preguntas-comunes.md` y pregunta: "¿Hay algo de tu negocio que el bot nunca
deba decir o prometer?" y "¿En qué casos prefieres contestar tú?". Lo que diga, tal cual.

## Lo que esta plantilla no puede hacer

Si la meta pide algo de la lista "Lo que esta plantilla no hace" de `tipos-de-bot.md` (cobrar
dentro del chat, dar seguimiento días después, entender fotos), dilo claro en el paso 1, no al
final. Propón la versión que sí se puede: el bot junta los datos y el dueño termina a mano.

## Así queda

| Qué | Valor |
|---|---|
| `modulos` | la pieza de la tabla de arriba, y `aviso: "telegram"` |
| `modulos.conocimiento` | `"archivo"` (Notion si cambia cada semana) |
| `revisor.precios` | `"conocimiento"`, o `"nunca"` si no quiere que diga precios |
| En `plan.md` | sección 4: qué parte de la meta no cubre ninguna pieza y cómo se resuelve |

## Pláticas de prueba

1. `camino-ideal.txt`: la mejor plática de la pregunta 1, de principio a fin.
2. `02-pregunta-frecuente.txt`: una de las cinco preguntas de la pregunta 3.
3. `03-no-sabe.txt`: algo que no está en lo que sabe. No lo inventa y pasa a una persona.
4. `04-pide-persona.txt`: pide hablar con alguien. Pasa a una persona.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
