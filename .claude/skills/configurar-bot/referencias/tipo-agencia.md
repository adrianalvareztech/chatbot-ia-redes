# Tipo · Agencia o consultoría

Agencia, despacho, consultor, cualquier servicio caro que se vende en una llamada. El bot
platica con quien escribe, entiende si el negocio lo puede ayudar y, si sí, le agenda la llamada.

**Meta del bot:** que la persona correcta agende la llamada.

## Preguntas de "Lo que sabe" (bloque E)

1. "¿Qué le resuelves a tu cliente, dicho como se lo dirías a él?" [`conocimiento.md`]
2. "¿Qué servicios das? Una línea de cada uno." [`conocimiento.md`]
3. "¿Cómo trabajas con un cliente nuevo: qué pasa primero, qué pasa después?" [`conocimiento.md`]
4. "¿Qué pasa en esa llamada, cuánto dura y cuesta algo?" [`conocimiento.md`. Si la llamada
   tiene precio y quiere que el bot lo diga, ese precio va aquí y `revisor.precios` queda en
   `"conocimiento"`.]
5. "¿Tienes casos o resultados de clientes que el bot pueda contar?" [`conocimiento.md`, solo
   los que dé, con sus palabras. Si no tiene, no se escribe ninguno.]

## Preguntas de "Lo que puede hacer" (bloque F)

6. "¿A quién sí atiendes? Descríbeme a tu cliente ideal." (giro, tamaño, lugar).
   [PRD 8 · `prompt.js`, el camino]
7. "¿A quién no? ¿Quién te escribe y no es tu cliente?" (estudiantes, gente que busca trabajo,
   gente que le quiere vender algo, negocios muy chicos). [`prompt.js`, casos: a ellos un
   mensaje amable que cierre, sin link y sin pasar la plática]
8. "¿Qué dos o tres cosas quieres saber de alguien antes de la llamada?" Recomendado: qué
   negocio tiene, qué quiere resolver. [`prompt.js`, el camino · `config.datos`]
9. "¿Cuál es tu link de Cal.com para esa llamada?" [`config.agenda.link`. Sin link:
   `"https://PENDIENTE"` y va a datos que faltan.]
10. "¿Quieres que te avise cada vez que le mande el link a alguien, con lo que sabe de esa
    persona?" Recomendado: sí. [`config.agenda.avisar`]
11. "¿El bot puede hablar de precios?" Recomendado: no; el precio se ve en la llamada.
    [`config.revisor.precios`: `"nunca"`]

## Lo que nunca hace (léeselo en el bloque G)

- Dar precios (si eligió "nunca") ni rangos.
- Prometer resultados, tiempos o ahorros.
- Diagnosticar el negocio de la persona o decirle qué herramienta usar: eso es de la llamada.
- Mandar el link de la llamada a quien no es el cliente que atiende.
- Hablar mal de otras agencias o herramientas.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Ya es cliente y pregunta por su proyecto.
- Pide una propuesta o un precio por escrito.
- Propone una colaboración o una alianza. (Quien solo le quiere vender algo no pasa: cierre amable.)
- Pide hablar con una persona, o hay una queja.
- Pregunta algo que no está en "Lo que sabe".

## Así queda

| Qué | Valor |
|---|---|
| `modulos.agenda` | `"link"`, con `agenda.avisar: true` |
| `modulos.conocimiento` | `"archivo"` |
| `modulos.aviso` | `"telegram"` |
| `modulos.pedidos`, `interesados`, `enlaces` | `false` |
| `datos` | los de la pregunta 8, por ejemplo `["nombre", "negocio", "que_quiere_resolver"]` |
| `revisor.precios` | `"nunca"` (o `"conocimiento"` si decidió dar precios) |

Si no tiene Cal.com y no quiere usarlo: `agenda: "ninguna"` e `interesados: true` con esos
mismos datos más `telefono`. El bot junta los datos y él llama.

## El camino, para el prompt

1. Qué negocio tiene.
2. Qué quiere resolver (y lo demás de la pregunta 8), una cosa por mensaje.
3. Si es el cliente que atiende: dile en una línea cómo lo pueden ayudar, con algo de "Lo que
   sabes", y ofrece la llamada. Cuando diga que sí: acción mandar_link_cita.
4. Si no es el cliente que atiende: un mensaje amable y honesto que cierre. Sin link.
5. Si dice que luego: un mensaje que cierre, sin insistir.

El bot platica, no interroga: reacciona a lo que le cuentan antes de la siguiente pregunta, y
no ofrece la llamada antes de entender qué necesita.

## Formato de "Lo que sabe"

Secciones cortas: qué hacemos, para quién, servicios, cómo trabajamos, la llamada, preguntas
frecuentes. Sin precios si `revisor.precios` es `"nunca"`.

## Pláticas de prueba

1. `camino-ideal.txt`: un dueño de negocio cuenta qué tiene y qué quiere resolver, acepta la
   llamada, recibe el link.
2. `02-pide-precio.txt`: "¿cuánto cobran?". No da precio y lleva a la llamada.
3. `03-no-es-cliente.txt`: alguien que busca trabajo o quiere vender algo. No recibe el link.
4. `04-ya-es-cliente.txt`: pregunta por su proyecto. Pasa a una persona.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
