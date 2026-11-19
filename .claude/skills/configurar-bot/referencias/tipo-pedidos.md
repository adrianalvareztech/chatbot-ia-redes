# Tipo · Pedidos

Café, taquería, pastelería, comida a domicilio. La persona pide, el bot arma la orden, el
sistema dice el total, la persona confirma y el negocio recibe el pedido.

**Meta del bot:** cerrar el pedido.

## Preguntas de "Lo que sabe" (bloque E)

1. "Pégame tu menú con precios, como lo tengas." [`conocimiento.md`, sección Menú]
   Revisa cada renglón y pregunta lo que no sea claro:
   - Un artículo con tamaños o variantes ("chico 45, grande 55") se escribe en un renglón por
     tamaño: `Latte chico`, `Latte grande`. Confírmale los nombres.
   - Un extra con costo ("leche de avena +10") es un renglón aparte: `Extra leche de avena`.
   - Un precio que dice "desde" o "según" no se puede pedir por el bot. Pregunta: "¿Eso lo
     tomas tú a mano?" Si sí, va como texto y pasa a una persona.
2. "¿Hay algo del menú que a veces se acaba o que solo hay ciertos días?" [`conocimiento.md`.
   Lo que solo hay ciertos días: columna `Días` con esos días (`viernes, sábado`); el sistema
   no lo deja pedir otro día. Lo que se acaba: columna `Disponible` en `no`, y lo cambia él
   cuando pase. Si eso le va a pasar cada semana, conviene Notion: lo cambia desde el celular.]
3. "¿Cómo entregan: recogen en el local, mandan a domicilio, las dos?" [`config.pedidos.entregas`]
4. Si hay domicilio: "¿Cuánto cuesta el envío y a qué zonas llegan?" [costo: `config.pedidos.entregas`;
   zonas: `conocimiento.md`. Si el costo cambia por zona y no hay un costo único, el domicilio
   no se cierra por el bot: lo toma una persona. Dilo y anótalo en PRD 13.]
5. "¿Cuánto tardan en tener listo un pedido?" [`conocimiento.md`. Si no quiere prometer
   tiempos, se escribe eso mismo con sus palabras, para que el bot tenga qué contestar cuando
   pregunten "cuánto tarda".]

## Preguntas de "Lo que puede hacer" (bloque F)

6. "¿Qué datos necesitas para preparar un pedido que recogen? ¿Y para uno a domicilio?"
   Recomendado: recoger pide nombre; domicilio pide nombre, dirección y teléfono.
   [`config.pedidos.entregas.<forma>.pide` y `config.datos`]
7. "¿Cómo te pagan en cada forma de entrega: al recibir, por transferencia, con un link de pago?"
   [Si es igual en todas: `config.pedidos.pago.texto`, una frase suya ("Pagas al recoger, en
   efectivo o con tarjeta"). Si cambia: `pago` dentro de cada entrega. Link de pago fijo:
   `config.pedidos.pago.link`. Transferencia: los datos de la cuenta van en ese texto, tal como
   los dé. Si no los tiene hoy, el texto dice solo lo que sí se sabe ("Pagas en efectivo o por
   transferencia; los datos de la cuenta te los pasa una persona") y la cuenta se anota como
   pendiente en el plan. Si piden comprobante: el texto dice que lo manden por ahí y que lo
   revisa una persona.]
8. "¿En qué horario toman pedidos? ¿Es el mismo que el del local?" [`config.pedidos.horario`,
   por día: `{ lunes: "08:00-20:00" }`. Un día que no aparece es un día cerrado.]
9. "¿A partir de qué tamaño de pedido prefieres atenderlo tú?" (20 cafés para una oficina).
   [`cantidad_maxima` (de un mismo artículo), `piezas_maximas` (en total) y `total_maximo`
   (en dinero). El tope es lo último que el bot sí cierra: "más de 10" es tope 10. Si no sabe:
   20 y sin los otros topes.]
10. "¿Quién recibe el pedido cuando se cierra: tú, la barra, la cocina?" [Es el aviso de la
    pregunta 16 de la entrevista. Varias personas: un grupo de Telegram.]

## Lo que nunca hace (léeselo en el bloque G)

- Inventar un platillo, un precio o un tiempo de entrega.
- Sumar o decir el total por su cuenta: el total lo escribe el sistema.
- Aceptar cambios a un pedido ya cerrado.
- Decir si algo le hace daño a alguien con una alergia.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Queja de un pedido, o un pedido que no llegó.
- Alergias o ingredientes que no están en "Lo que sabe".
- Pedido grande, o para otra fecha.
- Quiere cambiar o cancelar un pedido ya cerrado.
- Manda su comprobante de pago (una foto): el sistema avisa solo.

## Así queda

| Qué | Valor |
|---|---|
| `modulos.pedidos` | `true` |
| `modulos.agenda` | `"ninguna"` |
| `modulos.conocimiento` | `"archivo"`. `"notion"` si el menú o lo disponible cambia cada semana |
| `modulos.aviso` | `"telegram"` (obligatorio) |
| `datos` | `["nombre", "direccion", "telefono"]` según lo que pida cada entrega |
| `revisor.precios` | `"conocimiento"` |
| `mensajes.una_pregunta` | `true` |
| `dueno.horas_silencio` | Pregunta: en un café 12 horas puede ser mucho. 2 o 3 es común |

## El camino, para el prompt

1. Qué se le antoja. Si pregunta qué hay, dile dos o tres cosas del menú, no el menú completo.
2. Si pide algo con tamaños, pregunta cuál.
3. Cómo lo recibe (las formas de entrega que hay).
4. Los datos que pide esa entrega, uno por mensaje.
5. Con todo eso: acción resumir_pedido. El sistema escribe el resumen con el total.
6. Cuando diga que sí: acción cerrar_pedido. Si cambia algo, otra vez acción resumir_pedido.

En "Lo que nunca haces" del prompt va: "Sumar o decir un total. El total solo lo escribe el
sistema con la acción resumir_pedido."

## Formato de "Lo que sabe"

Cada cosa que se puede pedir va en una tabla con columna `Precio`, un renglón por artículo:

```
## Menú

| Artículo | Precio | Descripción |
|---|---|---|
| Latte chico | $45 | Café con leche, 8 oz |
| Latte grande | $55 | Café con leche, 12 oz |
```

Lo que **no** se pide (el costo del envío, promociones) va en frases normales, fuera de tablas
con precio. El costo del envío no se escribe como artículo: sale de `config.pedidos.entregas`.

## Pláticas de prueba

1. `camino-ideal.txt`: pide dos cosas del menú, para recoger, da su nombre, confirma.
2. `02-no-esta-en-el-menu.txt`: pide algo que no existe. El bot dice que no lo manejan.
3. `03-domicilio.txt` (si hay): pide a domicilio, da dirección, el total trae el envío.
4. `04-queja.txt`: "mi pedido llegó frío". Pasa a una persona y se calla.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.

Si la prueba propia no cabe en ninguna (alguien que pide y no pasa a recoger), es una plática
más, y en el prompt va el caso con lo que la persona decidió.

Con horario de pedidos, fija el reloj de las pruebas (ver `como-escribir-el-negocio.md`).

En `test/mi-negocio.test.js`, la prueba del camino ideal lleva el total que **tú** sumaste a
mano con los precios del menú: si el sistema da otro número, algo del menú se leyó mal.
