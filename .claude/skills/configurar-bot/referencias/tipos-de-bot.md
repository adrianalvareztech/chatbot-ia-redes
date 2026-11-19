# Tipos de bot

Ocho tipos más "Otro". Un negocio es de **uno**: el que describe lo que pasa al final de una buena plática.

## Cómo se lo preguntas

"Cuando alguien te escribe, ¿qué quieres que pase al final de la plática?"

| Si contesta algo como... | Tipo | Archivo |
|---|---|---|
| "Que agende su cita", "que aparte su hora", "que reserve" | Citas | `tipo-citas.md` |
| "Que me haga su pedido", "que ordene y yo lo preparo" (comida o bebida) | Pedidos | `tipo-pedidos.md` |
| "Que me compre", "que pida su producto y se lo mando", "que entre a mi tienda en línea" | Tienda | `tipo-tienda.md` |
| "Que me diga qué busca y un asesor lo atienda", "que vea las opciones y agende una visita" (muchas opciones caras: casas, autos, viajes) | Catálogo que califica | `tipo-catalogo.md` |
| "Que agende una llamada conmigo si es buen prospecto" (le vende a negocios o da un servicio caro) | Agencia o consultoría | `tipo-agencia.md` |
| "Que reciba el recurso que pidió", "que entre a mi comunidad o compre mi curso" (marca personal) | Creador | `tipo-creador.md` |
| "Que se inscriba", "que venga a una clase de prueba" (escuela, academia, talleres) | Cursos y clases | `tipo-cursos.md` |
| "Que me diga qué necesita para pasarle un precio", "cada trabajo es distinto" | Cotizaciones | `tipo-cotizaciones.md` |
| Nada de lo anterior, o dice "otro" | Otro | `tipo-otro.md` |

## Cuando dudas entre dos

| Duda | Pregunta que lo resuelve | Si dice... |
|---|---|---|
| Citas o Cotizaciones | "¿Tus precios son fijos o dependen de cada trabajo?" | Fijos: Citas. Dependen: Cotizaciones |
| Pedidos o Tienda | "¿Lo que vendes se prepara y se entrega el mismo día, o se manda por paquetería?" | Mismo día: Pedidos. Paquetería o tienda en línea: Tienda |
| Tienda o Catálogo | "¿La gente compra directo por mensaje, o primero necesita hablar con alguien?" | Compra directo: Tienda. Habla con alguien: Catálogo |
| Agencia o Cotizaciones | "¿Al final quieres una llamada agendada o que te lleguen los datos para cotizar?" | Llamada: Agencia. Datos: Cotizaciones |
| Creador o Cursos | "¿Vendes tu marca personal y tus recursos, o es una escuela con grupos y fechas?" | Marca personal: Creador. Escuela: Cursos |
| Citas o Cursos | "¿Atiendes de uno en uno con hora, o en grupos con fecha de inicio?" | Uno en uno: Citas. Grupos: Cursos |

Si el negocio hace dos cosas (un café que también renta el local para eventos), el bot tiene
**una** meta: la que más mensajes trae. La otra se resuelve pasando la plática a una persona, y
se anota en "Lo que queda fuera" del PRD.

Si de plano no cabe en ningún tipo, no lo fuerces: usa `tipo-otro.md`. Ahí la meta sale de
lo que la persona cuente y se arma con las mismas piezas.

## Qué pieza se prende en cada tipo

Punto de partida. Lo que diga la persona en la entrevista manda.

| Tipo | Lo que sabe | Agenda | Pedidos | Interesados | Enlaces | Precios |
|---|---|---|---|---|---|---|
| Citas | archivo | link (o dentro del chat) | no | no | no | los de Lo que sabe |
| Pedidos | archivo, o Notion si el menú cambia seguido | ninguna | sí | no | no | los de Lo que sabe |
| Tienda (vende por mensaje) | archivo o Notion | ninguna | sí | no | no | los de Lo que sabe |
| Tienda (tiene tienda en línea) | archivo o Notion | ninguna | no | no | sí, o link fijo | los de Lo que sabe |
| Catálogo que califica | Notion si cambia seguido | link si agenda visitas | no | sí | sí | los de Lo que sabe |
| Agencia o consultoría | archivo | link | no | no | no | nunca |
| Creador | archivo | ninguna (link si vende llamadas) | no | no | sí, o links fijos | los de Lo que sabe |
| Cursos y clases | archivo | link si hay clase de prueba | no | sí si inscribe una persona | link fijo de inscripción | los de Lo que sabe |
| Cotizaciones | archivo | ninguna | no | sí | no | nunca |
| Otro | archivo | según la meta | según la meta | según la meta | según la meta | los de Lo que sabe, o nunca |

El aviso al dueño (Telegram o correo) se prende siempre. Con pedidos o interesados es
obligatorio: sin aviso nadie recibe el pedido ni los datos.

## Lo que esta plantilla no hace

Dilo claro cuando el PRD lo pida. No lo prometas y no lo escondas.

1. **No escribe primero ni da seguimiento.** Solo contesta. Meta deja contestar dentro de las
   24 horas desde el último mensaje de la persona.
2. **Solo manda texto.** No manda fotos, PDFs ni audios. Manda el link donde están.
3. **No entiende fotos.** Si le mandan un comprobante de pago o la foto de un trabajo, le avisa
   al dueño para que conteste él. Las notas de voz sí, con la pieza de voz.
4. **No cobra dentro del chat.** Manda el link de pago o dice cómo se paga. Que el pago entró lo
   revisa una persona.
5. **No lleva inventario.** Lo que se acabó se marca a mano en "Lo que sabe" (`Disponible: no`).
6. **"Lo que sabe" tiene tope:** unos 30,000 caracteres, más o menos 200 renglones cortos. Un
   catálogo de 500 propiedades no cabe: se cargan las vigentes o las destacadas.
7. **No contesta comentarios de publicaciones.** Eso lo hace una automatización de Zernio que
   manda el primer mensaje; el bot atiende la plática que sigue.
8. **Agendar dentro del chat sirve para un solo tipo de cita.** Con varios servicios de distinta
   duración, se agenda con link.
9. **No reserva por noches** (hoteles, rentas por día). Junta los datos y los pasa (interesados).
10. **Un pedido es para ahora.** Un pedido para otra fecha se toma como nota y lo confirma una
    persona.
11. **Una cuenta, un negocio.** Dos sucursales con menús o precios distintos son dos bots.
