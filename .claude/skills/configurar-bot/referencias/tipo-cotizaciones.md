# Tipo · Cotizaciones

Contratistas, remodelación, jardinería, fumigación, mudanzas, eventos y banquetes, imprenta,
pasteles por encargo. Cada trabajo es distinto y el precio lo da una persona. El bot junta lo
necesario para cotizar y se lo pasa al dueño completo.

**Meta del bot:** que la persona deje todo lo que el dueño necesita para cotizar.

## Preguntas de "Lo que sabe" (bloque E)

1. "¿Qué trabajos haces? ¿Y cuáles no haces, aunque te los pidan?" [`conocimiento.md`]
2. "¿En qué zonas trabajas?" [`conocimiento.md`]
3. "¿Cómo es el proceso: vas a ver el trabajo, cotizas por foto, por mensaje?" [`conocimiento.md`]
4. "¿En cuánto tiempo mandas una cotización?" [`conocimiento.md`, solo si lo dice. Si no, el
   bot no promete tiempo.]
5. "¿Hay algún precio que sí sea fijo y el bot pueda decir?" (la visita, un mínimo).
   [Si hay: va en `conocimiento.md` y `revisor.precios` queda en `"conocimiento"`. Si ninguno:
   `"nunca"`.]
6. "¿Tienes licencia, seguro o garantía que la gente pregunte?" [`conocimiento.md`, tal cual]

## Preguntas de "Lo que puede hacer" (bloque F)

7. "¿Qué necesitas saber para cotizar? Dime todo lo que le preguntas a un cliente nuevo."
   Recomendado: qué trabajo es, en qué zona o dirección, para cuándo, y un teléfono.
   [`config.interesados.campos` · `config.datos`. De 3 a 5 datos: con más, la gente deja de
   contestar. Si pide muchos, pregunta cuáles son indispensables.]
8. "¿Necesitas fotos para cotizar?" [El bot no entiende fotos: cuando llega una, el sistema le
   avisa al dueño y el bot no contesta ese mensaje. En `prompt.js`: el bot le dice que mande
   sus fotos por ahí y que las ve una persona. En las pruebas: `/foto` en el guion y
   `p.adjunto("imagen")` en `test/mi-negocio.test.js`.]
9. "¿Quieres agendar la visita con un link, o la acuerdas tú por teléfono?"
   [Con link de Cal.com: `agenda: "link"`. Si no: `"ninguna"`.]

## Lo que nunca hace (léeselo en el bloque G)

- Dar un precio, un rango o un "más o menos".
- Prometer una fecha de inicio o de entrega.
- Decir que sí se hace un trabajo que no está en "Lo que sabe".
- Opinar de cómo arreglar algo: eso lo ve quien cotiza.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Una urgencia (una fuga, algo que no puede esperar).
- Un reclamo o la garantía de un trabajo ya hecho.
- Insiste en un precio exacto antes de dar sus datos.
- Un trabajo que no está en la lista de lo que hace ni de lo que no hace.
- Una queja, o pide hablar con una persona.

## Así queda

| Qué | Valor |
|---|---|
| `modulos.interesados` | `true`, con `campos` de la pregunta 7 |
| `modulos.agenda` | `"ninguna"` (o `"link"`) |
| `modulos.conocimiento` | `"archivo"` |
| `modulos.aviso` | `"telegram"` (obligatorio) |
| `datos` | por ejemplo `["nombre", "trabajo", "zona", "para_cuando", "telefono"]` |
| `revisor.precios` | `"nunca"` (o `"conocimiento"`, ver pregunta 5) |
| `adjuntos` | `"avisar"`: las fotos le llegan como aviso al dueño |

## El camino, para el prompt

1. Qué trabajo necesita.
2. Los demás datos de la pregunta 7, uno por mensaje, en el orden en que el dueño los pregunta.
3. Si el trabajo o la zona no los atiende: díselo con amabilidad y cierra.
4. Con todos los datos: acción registrar_interesado, y le dices que le mandan su cotización.
5. Si pide precio: explica en una línea por qué se cotiza (cada trabajo es distinto) y sigue
   con el dato que falta.

## Formato de "Lo que sabe"

Secciones cortas: qué hacemos, qué no hacemos, zonas, cómo cotizamos, garantía, preguntas
frecuentes. Sin precios, salvo los fijos de la pregunta 5.

## Pláticas de prueba

1. `camino-ideal.txt`: cuenta qué necesita, da sus datos, queda registrado para cotizar.
2. `02-pide-precio.txt`: "¿más o menos cuánto?". No da precio y sigue juntando datos.
3. `03-fuera-de-zona.txt`: un trabajo o una zona que no atiende.
4. `04-urgencia.txt`: una urgencia. Pasa a una persona.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
