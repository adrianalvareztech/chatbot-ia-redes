# Tipo · Cursos y clases

Academia de idiomas, escuela de baile, gimnasio con clases, talleres, cursos presenciales o en
línea con grupos y fechas.

**Meta del bot:** una sola. Elige con la persona:

- Que se inscriba (hay un link de inscripción o de pago), o
- Que agende su clase de prueba (hay un link de Cal.com), o
- Que deje sus datos para que alguien de la escuela lo inscriba.

## Preguntas de "Lo que sabe" (bloque E)

1. "Pégame tus cursos o clases: nombre, para quién es, días y horario, cuándo empieza, cuánto
   dura y cuánto cuesta." [`conocimiento.md`, un renglón por curso o grupo]
2. "¿Hay inscripción, mensualidad, materiales u otro costo aparte?" [`conocimiento.md`]
3. "¿Hay requisitos: edad, nivel, examen de ubicación?" [`conocimiento.md`]
4. "¿Qué pasa si falta a una clase o se quiere dar de baja?" [`conocimiento.md`, si lo dice]
5. "¿Cada cuánto cambian las fechas y los grupos, y quién los cambia?" [Si cambian cada mes y
   los cambia alguien de la escuela: Notion.]

## Preguntas de "Lo que puede hacer" (bloque F)

6. "¿Cómo se inscribe alguien hoy?"
   - Con un link (formulario, pago, tienda): `acciones.mandar_inscripcion` con ese link. Si cada
     curso tiene su link, van en "Lo que sabe" y se prende enlaces.
   - Viene a una clase de prueba: `agenda: "link"` con el link de Cal.com.
   - Alguien de la escuela lo inscribe: `interesados: true`.
7. Si es interesados: "¿Qué datos necesita quien lo inscribe?" Recomendado: nombre, curso que
   le interesa, teléfono. Si es para un menor: nombre y edad del alumno.
   [`config.interesados.campos` · `config.datos`]
8. "¿Qué necesitas saber para recomendarle un curso?" (edad, nivel, horario que puede).
   [`prompt.js`, el camino]

## Lo que nunca hace (léeselo en el bloque G)

- Inventar una fecha, un horario, un precio o si hay cupo.
- Prometer resultados ("en tres meses hablas inglés").
- Ofrecer descuentos o becas que no estén en "Lo que sabe".
- Decir en qué nivel queda alguien: eso lo dice la escuela.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Becas, descuentos, facturas o un plan de pagos.
- Un alumno ya inscrito con un problema (pago, baja, cambio de grupo).
- Un caso especial (un menor, alguien con una necesidad particular).
- Pregunta por un curso o una fecha que no está en "Lo que sabe".
- Una queja, o pide hablar con una persona.

## Así queda

| Qué | Valor |
|---|---|
| `acciones` | `mandar_inscripcion` con link fijo, si hay uno solo |
| `modulos.enlaces` | `true` si cada curso tiene su link |
| `modulos.agenda` | `"link"` si hay clase de prueba; si no, `"ninguna"` |
| `modulos.interesados` | `true` si inscribe una persona |
| `modulos.conocimiento` | `"archivo"`, o `"notion"` si las fechas cambian cada mes |
| `modulos.aviso` | `"telegram"` |
| `datos` | `["nombre", "curso", "telefono"]` y lo de la pregunta 8 |

## El camino, para el prompt

1. Qué quiere aprender, o para quién es.
2. Lo necesario para recomendar (pregunta 8), una cosa por mensaje.
3. Recomienda **un** curso de "Lo que sabes" con su horario y su precio.
4. Si le interesa: la acción de la meta (acción mandar_inscripcion, acción mandar_link,
   acción mandar_link_cita, o pedir los datos y acción registrar_interesado).
5. Si dice que luego: un mensaje que cierre, sin insistir.

## Formato de "Lo que sabe"

```
| Curso | Para quién | Días y horario | Empieza | Precio |
|---|---|---|---|---|
| Inglés básico | Adultos desde cero | Lunes y miércoles 19:00 a 20:30 | 12 de enero | $1,200 al mes |
```

## Pláticas de prueba

1. `camino-ideal.txt`: pregunta por un curso, recibe horario y precio, llega a la acción de la meta.
2. `02-fecha-que-no-esta.txt`: pregunta por un horario que no existe. No inventa.
3. `03-beca.txt`: pide beca o descuento. Pasa a una persona.
4. `04-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
