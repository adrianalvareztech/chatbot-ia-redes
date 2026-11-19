# PRD · Chatbot con inteligencia artificial para redes

> **Cómo se usa esta plantilla.** No la llenes a mano. Pégasela a Claude Code junto con el
> prompt de la entrevista (está en `prompts/02-entrevista-prd.md` del repositorio) y deja que
> te haga las preguntas una por una. Al final, este archivo queda lleno y guardado en tu
> proyecto como `PRD.md`. Es lo que Claude va a leer cada vez que construya o cambie algo.
>
> Lo que está entre corchetes `[ ]` es lo que se llena. Si una sección no aplica a tu
> negocio, escribe "No aplica" en vez de borrarla, para que Claude sepa que lo pensaste.

---

## 1. El negocio

- **Nombre del negocio:** [ ]
- **A qué se dedica, en una frase:** [ ]
- **Quién le escribe por mensaje:** [quién es la persona típica que manda DM y qué suele preguntar]
- **Idioma:** [en qué idioma contesta el bot. Ejemplo: "en el idioma en que le escriban"]
- **Horario del negocio:** [para que el bot sepa qué decir fuera de horario]

## 2. El objetivo del bot

Una sola acción principal. Es lo que cuenta como éxito en una conversación.

- **Acción principal:** [agendar una cita · tomar una orden · mandar un link de compra · agendar una llamada · mandar un recurso · contestar sobre una propiedad y agendar visita]
- **Por qué importa:** [qué pasa hoy sin el bot. Ejemplo: "los mensajes del fin de semana se contestan el lunes y la persona ya se fue con otro"]

## 3. Canales

- [ ] Instagram
- [ ] WhatsApp
- [ ] Messenger (Facebook)

**Desde dónde le escriben:** [DM directo · comentario en un post que pide una palabra · anuncio · link en la bio]

## 4. Personalidad y tono

- **Cómo habla:** [ejemplo: "tutea, mensajes cortos, una idea por mensaje, cero emojis"]
- **Cómo se presenta:** [¿dice que es un asistente con inteligencia artificial? Recomendado: sí, si se lo preguntan]
- **Tres mensajes de ejemplo que suenan al negocio:**
  1. [ ]
  2. [ ]
  3. [ ]

## 5. Lo que sabe (archivo o Notion)

Lo que el bot sabe del negocio: servicios, precios, horarios, preguntas frecuentes. El bot lo
lee antes de contestar. Puede vivir en un archivo del proyecto (lo más simple) o en Notion (si el
dueño va a cambiar precios seguido sin tocar código). Se elige en la sección 7.

| Tema o base | Para qué la usa el bot | Qué trae |
|---|---|---|
| [Servicios / Menú / Propiedades / Productos] | [ ] | [nombre, precio, descripción, disponible sí/no...] |
| Preguntas frecuentes | Contestar lo que siempre preguntan | pregunta, respuesta |
| [otra si hace falta] | [ ] | [ ] |

**Quién lo actualiza y cada cuánto:** [ ]

## 6. Lo que puede hacer (sus herramientas)

Cada acción que el bot puede ejecutar, más allá de contestar.

| Acción | Con qué la hace | Cuándo la usa |
|---|---|---|
| [Mandar el link para agendar] | [Cal.com] | [cuando la persona quiere agendar] |
| [Agendar dentro del chat] | [Cal.com] | [cuando la persona eligió horario y dio su nombre y correo] |
| [Mandar link de pago] | [Stripe] | [ ] |
| [Avisar al dueño] | [Telegram · correo] | [ver sección 10] |

## 7. Módulos (lo que se prende)

| Módulo | Opciones | Elegido | Datos que necesita |
|---|---|---|---|
| Lo que sabe | archivo · Notion | [ ] | [id de la página o de las bases de Notion] |
| Agenda | ninguna · link de Cal · agendar dentro del chat | [ ] | [link, o id del tipo de cita y cuántos días ofrecer] |
| Aviso al dueño | Telegram · correo · ninguno | [ ] | [chat de Telegram o correo] |
| Notas de voz | sí · no | [ ] | |

**Ajustes**

- **Cuánto espera a que la persona termine de escribir:** [10 segundos]
- **Cuando contestas a mano, el bot se calla:** [12 horas · para siempre]
- **Frase para devolverle la plática al bot:** ["te dejo con mi asistente"]
- **Precios:** [da los que están en "Lo que sabe" · nunca da precios]
- **Mensajes por respuesta y largo máximo:** [3 mensajes, 300 caracteres]
- **Si mandan una foto o un audio que no entiende:** [te avisa · lo ignora]
- **Links que sí puede mandar además de los de "Lo que sabe":** [ ]
- **Acciones propias con link fijo:** [mandar el menú → link]

## 8. Cómo va una conversación

**El camino ideal**, paso por paso:

1. La persona escribe: [ ]
2. El bot: [ ]
3. [ ]
4. Termina cuando: [se cumple la acción principal de la sección 2]

**Los otros caminos** (lo que pasa seguido y no es el camino ideal):

- **Si pregunta algo que no está en "Lo que sabe":** [ ]
- **Si pregunta el precio sin dar contexto:** [ ]
- **Si no contesta después de un rato:** [en esta versión el bot no manda seguimientos: solo contesta. Ojo: Meta solo deja contestar dentro de las 24 horas desde su último mensaje]
- **Si escribe fuera de horario:** [ ]

## 9. Lo que nunca hace

- [Ejemplo: inventar un precio o una disponibilidad que no está en "Lo que sabe"]
- [Ejemplo: dar un diagnóstico médico, legal o financiero]
- [Ejemplo: prometer descuentos]
- [ ]

## 10. Cuándo le pasa la plática a una persona

- **Se calla y avisa cuando:** [la persona pide hablar con alguien · hay una queja · es una urgencia · ...]
- **Se calla solo cuando el dueño contesta a mano:** sí (no se cambia: si no, el bot le contesta encima)
- **Cuánto tiempo se calla y cómo se le regresa la plática:** ver los ajustes de la sección 7
- **Cómo avisa al dueño:** [Telegram · correo] con [qué datos: nombre, de qué trata, lo último que escribió]

## 11. Lo que guarda de cada persona

- [nombre · qué preguntó · si agendó o compró · a qué se dedica · ...]
- **Dónde:** en la base de datos de Cloudflare donde vive el bot (D1). Notion no se usa para esto: es lenta y tiene límite de peticiones.

## 12. Cómo sabemos que funciona

Antes de conectarlo a la cuenta real, probamos con un simulador de mensajes:

- [ ] El camino ideal termina en la acción principal.
- [ ] Pregunta algo que no está en "Lo que sabe": no inventa.
- [ ] Pide hablar con una persona: se calla y avisa.
- [ ] Cambiamos un precio en "Lo que sabe": el bot da el precio nuevo.
- [ ] Contestas tú a mano: el bot se calla. Escribes la frase de regreso: el bot retoma.
- [ ] [prueba propia de tu negocio]

## 13. Lo que queda fuera de esta versión

Para que Claude no lo construya todavía.

- [ ]
- [ ]

---

## Anexo · El mismo bot en cuatro negocios

El código es el mismo en todos. Cambian las secciones 2, 5, 6, 7 y 10 del PRD.

| | Creador o infoproductor | Dentista o clínica | Comida rápida | Bienes raíces |
|---|---|---|---|---|
| **Acción principal (2)** | Mandar el recurso y llevar a una llamada o a la compra | Agendar una cita | Tomar la orden completa | Contestar sobre una propiedad y agendar visita |
| **Lo que sabe (5)** | Productos, recursos, preguntas frecuentes | Servicios, precios, seguros que acepta | Menú, precios, ofertas del día | Propiedades disponibles con fotos, zona y precio |
| **Herramientas (6)** | Link de compra, Cal.com para llamada | Cal.com | Link de pago, aviso a cocina | Cal.com para visita, mandar fotos |
| **Pasa a humano (10)** | La persona está lista para comprar algo grande | Urgencia o pregunta médica | Queja de una orden | Quiere hacer una oferta |
