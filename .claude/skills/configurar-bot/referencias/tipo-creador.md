# Tipo · Creador o marca personal

Creador de contenido, infoproductor, coach, alguien con comunidad o curso propio. La gente le
escribe por un recurso que prometió en un video, o para preguntar por su comunidad o su curso.

**Meta del bot:** una sola. Elige con la persona:

- Que reciba el recurso que pidió (si casi todos los mensajes son por recursos), o
- Que entre a la comunidad o compre el curso (si los recursos los manda otra automatización).

## Preguntas de "Lo que sabe" (bloque E)

1. "¿Por qué te escribe la gente: por un recurso que ofreciste, para preguntar por tu comunidad
   o curso, por otra cosa?" [PRD 2: define la meta]
2. "¿Qué recursos regalas? Dame el nombre de cada uno, la palabra con que lo piden y su link."
   [`conocimiento.md`, un renglón por recurso con su link completo. Un recurso sin link no se
   puede mandar: va a pendientes.]
3. "¿Cómo le llega hoy el recurso a quien comenta una palabra en tu publicación?"
   - Con una automatización de Zernio o de otra app: bien, el bot atiende la plática que sigue.
   - A mano, o no tiene nada: explícale el punto 7 de "Lo que esta plantilla no hace". El bot sí
     manda el recurso a quien se lo pide **por mensaje**. Anótalo en PRD 13, y en el plan
     escribe la salida: en Zernio se crea una automatización por publicación ("si
     comentan PALABRA, mándale este mensaje"). Ese primer mensaje lo manda Zernio; cuando la
     persona contesta, ya la atiende el bot.
4. "¿Qué vendes: comunidad, curso, mentoría? ¿Qué incluye, cuánto cuesta y dónde se entra?"
   [`conocimiento.md`: qué incluye y precio. El link va en `config.acciones`.]
5. "¿Está abierta la inscripción o hay lista de espera?" [`conocimiento.md`. El link que se
   manda es el de lo que está abierto hoy.]

## Preguntas de "Lo que puede hacer" (bloque F)

6. "Después de mandar el recurso, ¿quieres que el bot platique con la persona?" Recomendado:
   una sola pregunta, sin vender ("¿a qué te dedicas?", "¿qué quieres lograr con esto?").
   [`prompt.js`, el camino · `config.datos`]
7. "¿Cuándo sí quieres que mencione tu comunidad o tu curso?" Recomendado: solo si la persona
   pregunta, o si lo que cuenta es justo lo que se resuelve ahí. [`prompt.js`, el camino]
8. "¿Vendes llamadas o mentorías con agenda?" [Si sí: `agenda: "link"` con su link.]

## Lo que nunca hace (léeselo en el bloque G)

- Inventar un recurso, un precio o lo que incluye la comunidad.
- Prometer resultados ("vas a ganar tanto").
- Ofrecer la comunidad o el curso antes de entender qué busca la persona.
- Hablar de marcas o de otros creadores.
- Contestar como si fuera el creador en persona, si le preguntan directo.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Una marca o agencia propone una colaboración o un patrocinio.
- Un alumno o miembro tiene un problema con su acceso o pide un reembolso.
- Alguien pide una mentoría o algo que no está en "Lo que sabe".
- Le hablan como amigo o conocido: el bot se calla.

## Así queda

| Qué | Valor |
|---|---|
| `modulos.enlaces` | `true` si son tres recursos o más, o si cambian seguido. Con uno o dos: `false` y cada uno como acción con link fijo |
| `acciones` | `mandar_comunidad` o `mandar_curso`, con el link de inscripción |
| `modulos.agenda` | `"ninguna"` (o `"link"` si vende llamadas) |
| `modulos.conocimiento` | `"archivo"`. `"notion"` si saca recursos nuevos cada semana |
| `modulos.aviso` | `"telegram"` |
| `datos` | `["nombre", "a_que_se_dedica", "recurso"]` |
| `dueno.horas_silencio` | Pregunta: un creador que contesta mucho a mano suele querer `0` (para siempre). Avísale lo que dice la pregunta 17: con `0`, una plática que el bot pasó tampoco la retoma |

## El camino, para el prompt

1. Si pide un recurso que está en "Lo que sabes": acción mandar_link con su link (o la acción
   con link fijo de ese recurso). Un mensaje corto antes, sin explicar el recurso y sin
   pregunta: el link llega al final de ese turno.
2. Cuando la persona conteste algo después del recurso (un "gracias" basta): una pregunta para
   conocerla (la de la pregunta 6).
   Un recurso que existe y todavía no tiene link: dile que todavía no está listo. No mandes otro.
3. Si pregunta por la comunidad o el curso, o lo que cuenta se resuelve ahí: cuéntale qué es
   en dos líneas con "Lo que sabes". Si quiere entrar: acción mandar_comunidad.
4. Si no pregunta más, no insistas.

## Formato de "Lo que sabe"

```
## Recursos

| Recurso | Palabra | Qué es | Link |
|---|---|---|---|
| Guía de prompts | GUIA | 20 prompts para ventas | https://ejemplo.com/guia |
```

Y secciones cortas: quién es, la comunidad o el curso (qué incluye, precio, para quién),
preguntas frecuentes.

## Pláticas de prueba

1. `camino-ideal.txt`: escribe la palabra de un recurso, lo recibe, contesta la pregunta.
2. `02-recurso-que-no-existe.txt`: pide algo que no está. No inventa un link.
3. `03-comunidad.txt`: pregunta por la comunidad o el curso y recibe el link.
4. `04-marca.txt`: una marca propone una colaboración. Pasa a una persona.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
