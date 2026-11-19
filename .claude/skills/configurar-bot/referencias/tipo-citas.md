# Tipo · Citas

Dentista, clínica, estética, barbería, spa, veterinaria, taller, despacho que atiende con hora.

**Meta del bot:** que la persona agende su cita.

## Preguntas de "Lo que sabe" (bloque E)

1. "Pégame tu lista de servicios con precios y cuánto dura cada uno, como la tengas."
   [`conocimiento.md`. Un precio "desde" se escribe con el "desde", tal cual.]
2. "¿Hay precios que solo se saben después de revisar a la persona?" [`conocimiento.md`: la
   frase que usa el negocio, por ejemplo "el precio lo confirma el doctor en la valoración".]
3. "¿Quién atiende? ¿La gente pide a alguien en especial?" [`conocimiento.md`]
4. "¿Qué tiene que saber o traer alguien antes de su primera cita?" [`conocimiento.md`]

## Preguntas de "Lo que puede hacer" (bloque F)

5. "¿Cómo agendan hoy: libreta, WhatsApp, Google Calendar, alguna app?"
6. "¿Tienes Cal.com o quieres usarlo? Es gratis: el bot manda un link y la persona elige su
   hora ahí." [`config.modulos.agenda`]
   - Sí, con link: `"link"`. Pide el link de su cita. Si no lo tiene: `"https://PENDIENTE"`.
   - Quiere que agende sin salir del chat y tiene **un solo** tipo de cita: `"cal"`. Avísale
     que el bot va a pedir nombre y correo, y que hace falta una llave más.
   - No quiere agenda en línea: `"ninguna"` y la pieza de interesados prendida. El bot junta
     nombre, servicio y día que prefiere, y se los manda para que él confirme a mano.
7. "¿Qué necesitas saber de la persona antes de que agende?" (qué servicio, si es primera vez).
   [`prompt.js`, el camino · `config.datos`]
8. "¿Quieres que te avise cada vez que le mande el link a alguien?" [`config.agenda.avisar`]

## Lo que nunca hace (léeselo en el bloque G)

- Inventar un precio, un horario o una disponibilidad.
- Dar un diagnóstico o recomendar un tratamiento (salud, legal, mecánica): eso lo hace quien atiende.
- Prometer descuentos o resultados.
- Decir que hay lugar a una hora si no agenda dentro del chat.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Urgencia (dolor fuerte, accidente, mascota grave).
- Pregunta médica, legal o técnica que no está en "Lo que sabe".
- Queja o reclamo, o pide hablar con una persona.
- Quiere cambiar o cancelar una cita que ya tiene.

## Así queda

| Qué | Valor |
|---|---|
| `modulos.agenda` | `"link"` (recomendado), `"cal"` o `"ninguna"` |
| `modulos.conocimiento` | `"archivo"` |
| `modulos.aviso` | `"telegram"` |
| `modulos.interesados` | `true` solo si agenda = ninguna, con `campos: ["nombre", "servicio", "dia_preferido"]` |
| `datos` | `["nombre", "servicio"]` |
| `revisor.precios` | `"conocimiento"` |

## El camino, para el prompt

1. Qué necesita.
2. Lo que el negocio quiere saber antes (pregunta 7), una cosa por mensaje.
3. Cuando ya sabes qué necesita y quiere ir: acción mandar_link_cita.
   (Con agenda dentro del chat: ofrece dos o tres HORARIOS LIBRES, pide nombre y correo, y
   entonces acción agendar. Sin agenda: pide los datos y acción registrar_interesado.)
4. Si dice que luego: un mensaje amable que cierre, sin insistir.

## Formato de "Lo que sabe"

Servicios en una tabla (Servicio, Precio, Duración). Horario, dónde están, formas de pago y
preguntas frecuentes en secciones cortas.

## Pláticas de prueba

1. `camino-ideal.txt`: pregunta por un servicio y su precio, quiere agendar, recibe el link.
2. `02-no-sabe.txt`: pregunta un precio que no está. Pasa a una persona, no inventa.
3. `03-urgencia.txt`: una urgencia del giro. Pasa a una persona y se calla.
4. `04-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
