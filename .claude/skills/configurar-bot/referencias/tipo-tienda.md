# Tipo · Tienda

Ropa, cosméticos, joyería, artesanías, accesorios. Hay dos formas de vender y la primera
pregunta decide cuál.

**Meta del bot:** cerrar el pedido (si vende por mensaje) o mandar a la persona al producto en
la tienda en línea (si tiene una).

## La pregunta que decide

Va al inicio del bloque E de la entrevista, antes que cualquier otra de este archivo.

"¿Cómo te compran hoy: te piden por mensaje y tú lo mandas, o tienes una tienda en línea donde
pagan solos?"

- **Por mensaje:** se prende la pieza de pedidos. Sigue "A · Vende por mensaje".
- **Tienda en línea:** se prende enlaces (o un link fijo). Sigue "B · Tiene tienda en línea".
- Las dos: gana la tienda en línea. El bot manda al producto, y lo que no esté ahí pasa a una persona.

## A · Vende por mensaje

Preguntas de "Lo que sabe" (bloque E):

1. "Pégame tu catálogo con precios." [`conocimiento.md`. Un renglón por cada cosa que se puede
   pedir. Si un producto tiene tallas o colores con el mismo precio, es **un** renglón con la
   columna `Tallas` (u `Opciones`) llena: `6, 7, 8`. El sistema no deja resumir el pedido sin
   que la persona diga cuál. Si la talla cambia el precio, un renglón por talla.]
2. "¿Qué tallas, colores o medidas manejas, y cómo sabe la persona cuál le queda?" [`conocimiento.md`]
3. "¿Qué se te acaba seguido? ¿Hay algo agotado hoy?" [Columna `Disponible`: `no` solo en lo
   que diga que hoy no hay; lo demás se deja vacío. Dile el punto 5 de "Lo que esta plantilla
   no hace": el inventario se marca a mano.]
4. "¿Cómo entregas: paquetería, punto de entrega, recogen contigo? ¿Cuánto cuesta cada una?"
   [`config.pedidos.entregas`: una entrada por forma, con su costo fijo. Si el envío se cotiza
   por destino, esa forma no se cierra por el bot: pasa a una persona.]
5. "¿Cuánto tarda en llegar? ¿Aceptas cambios o devoluciones, y cómo?" [`conocimiento.md`]

Preguntas de "Lo que puede hacer" (bloque F):

6. "¿Qué datos necesitas para mandar un pedido?" Recomendado para paquetería: nombre, dirección
   completa con código postal y teléfono. [`config.pedidos.entregas.<forma>.pide` · `config.datos`]
7. "¿Cómo te pagan?" [`config.pedidos.pago`. Transferencia: los datos de la cuenta van en
   `pago.texto`, tal como los dé, y la frase "manda tu comprobante por aquí". Link de pago fijo:
   `pago.link`.]
8. "¿Vendes de mayoreo? ¿A partir de cuántas piezas?" [`config.pedidos.piezas_maximas`: el
   total de piezas que el bot sí cierra. "A partir de 12" es tope 11. Arriba pasa a una persona.]

Así queda: `modulos.pedidos: true`, `agenda: "ninguna"`, `aviso: "telegram"`,
`datos: ["nombre", "direccion", "codigo_postal", "telefono"]`, `pedidos.horario: null` (una
tienda toma pedidos a cualquier hora, salvo que diga otra cosa).

El camino: qué producto le interesa → talla o color si aplica (va en la nota) → cómo lo recibe
→ los datos de esa entrega, uno por mensaje → acción resumir_pedido → cuando diga que sí,
acción cerrar_pedido.

## B · Tiene tienda en línea

Preguntas de "Lo que sabe" (bloque E):

1. "¿Cuál es el link de tu tienda?" [`config.acciones.mandar_tienda.link`]
2. "¿Quieres que el bot mande el link del producto exacto, o con el de la tienda basta?"
   - Producto exacto: pide la lista de productos con su precio y su link. [`conocimiento.md`,
     un renglón por producto con su link · `modulos.enlaces: true`]
   - Con la tienda basta: solo el link fijo. [`modulos.enlaces: false`]
3. "¿Qué preguntan antes de comprar?" (tallas, envíos, cambios, tiempos). [`conocimiento.md`]

Así queda: `modulos.pedidos: false`, `modulos.enlaces` según la pregunta 2,
`acciones: { mandar_tienda: { descripcion: "Quiere ver todo o comprar y no pidió un producto en especial", link } }`,
`datos: ["nombre", "que_busca"]`.

El camino: qué busca → resuelve su duda con "Lo que sabes" → acción mandar_link con el link del
producto (o acción mandar_tienda).

## Lo que nunca hace (léeselo en el bloque G)

- Inventar un precio, una talla disponible o un tiempo de entrega.
- Decir que el pago ya entró: eso lo revisa una persona.
- Prometer cambios o devoluciones distintos a los de "Lo que sabe".
- Sumar o decir el total por su cuenta (si toma pedidos).

## Cuándo pasa a una persona (léeselo en el bloque H)

- Cambio, devolución, una queja o un paquete que no llegó.
- Pide hablar con una persona.
- Mayoreo o un pedido especial.
- Manda su comprobante de pago (una foto): el sistema avisa solo.
- Pregunta por algo que no está en el catálogo.

## Formato de "Lo que sabe"

Con pedidos: tabla con columna `Precio`, un renglón por lo que se puede pedir.
Con enlaces: cada producto con su link completo en el mismo renglón:

```
| Producto | Precio | Link |
|---|---|---|
| Bolsa Lola negra | $890 | https://tienda.com/bolsa-lola-negra |
```

## Pláticas de prueba

1. `camino-ideal.txt`: pregunta por un producto, lo pide (o recibe su link).
2. `02-no-esta-en-catalogo.txt`: pide algo que no vende.
3. `03-cambio.txt`: quiere cambiar algo que ya compró. Pasa a una persona.
4. `04-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
