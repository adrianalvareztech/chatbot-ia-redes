# La entrevista: preguntas para todo negocio

Va en bloques, en este orden. Una pregunta a la vez. Lo que ya contestó en el paso 1 no se
repite. Entre corchetes: a dónde va la respuesta.

Donde dice **[TIPO]**, mete ahí las preguntas del archivo del tipo elegido.

Son de 20 a 28 preguntas cortas según el tipo. Díselo antes de empezar, y dile que puede pegar
lo que ya tenga escrito (menú, precios, preguntas frecuentes, textos de su página).

Si quien contesta instala el bot para un cliente y no sabe un dato, no insistas: anótalo como
pendiente "se lo pregunta al dueño" y al final de la entrevista dale la lista junta, para que
la resuelva en un solo mensaje con su cliente.

## A · El negocio  [PRD 1]

1. "¿En qué ciudad están y cuál es su horario de atención?"
   [PRD 1 horario · `conocimiento.md` · `config.zona_horaria`: la zona de esa ciudad, por ejemplo
   Tijuana = `America/Tijuana`, Ciudad de México = `America/Mexico_City`, Bogotá = `America/Bogota`.
   Dile cuál pusiste.]
2. "¿Quién les escribe casi siempre y qué preguntan? Dame de 3 a 5 preguntas tal como te las
   escriben, con lo que tú contestas." [PRD 1 quién le escribe · preguntas frecuentes de
   `conocimiento.md`. Esta es la única vez que se piden las preguntas frecuentes.]
3. "¿En qué idioma contesta el bot?" Si no sabe: "en el idioma en que le escriban". [PRD 1]

## B · El objetivo  [PRD 2]

4. Ya sabes la acción principal por el tipo. Confírmala en una frase y pregunta:
   "¿Qué pasa hoy con esos mensajes cuando no alcanzas a contestar?" [PRD 2 por qué importa]

## C · Canales  [PRD 3]

5. "¿Desde dónde te escriben más: te mandan mensaje directo, contestan una historia, vienen de
   un anuncio, comentan una publicación?" [PRD 3]
   - Si dice "comentan una palabra en una publicación": explícale el punto 7 de "Lo que esta
     plantilla no hace" y anótalo en PRD 13.
   - Si eligió WhatsApp: pregunta si ese número lo usan hoy desde el celular. [PRD 3. Va a
     `plan.md`, datos que faltan: cómo contesta el dueño a mano en WhatsApp se confirma al conectar.]

## D · Cómo habla  [PRD 4]

6. "¿Cómo le hablan a sus clientes: de tú o de usted, con emojis o sin emojis?"
7. "Pégame dos o tres mensajes reales que tú le hayas mandado a un cliente. Así el bot suena a
   ti." [PRD 4, tal cual. Si no tiene, pídele que escriba cómo saludaría. No los escribas tú.]
8. "Si le preguntan si es un bot, ¿está bien que diga que es el asistente con inteligencia
   artificial de [negocio]?" Recomendado: sí. [PRD 4]

## E · Lo que sabe  [PRD 5]

9. **[TIPO] · preguntas de "Lo que sabe".** Si el archivo del tipo trae una "pregunta que
   decide", va primero.
10. Solo lo que falte de esta lista y aplique al negocio, en una sola pregunta: "¿Algo de esto
    que deba saber el bot: dirección, formas de pago, garantía, cambios o devoluciones,
    facturas, estacionamiento?" [`conocimiento.md`. No repitas lo que ya contestó en la 2.]
11. "¿Qué teléfono, correo o links puede dar el bot?" (sitio, mapa, WhatsApp). [`conocimiento.md`.
    El bot solo puede dar los que estén ahí escritos.]
12. "¿Quién cambia los precios o la información, y cada cuánto?" [PRD 5. Si el archivo del
    tipo ya lo preguntó, no la repitas.]
    - Casi nunca, o los cambia quien instala el bot: **archivo**.
    - Seguido (cada semana o más), y los cambia alguien que no va a abrir Claude Code: **Notion**.
    - Si va a ser Notion: "¿Ya llevas esa información en Notion? ¿Qué columnas tiene?" Si ya
      existe, el bot lee esa misma página o base: no se crea otra. Anota sus columnas tal cual.

## F · Lo que puede hacer  [PRD 6 y 7]

13. **[TIPO] · preguntas de "Lo que puede hacer".**

## G · Lo que nunca hace  [PRD 9]

14. Lee en voz alta los "nunca" que trae el archivo del tipo y pregunta: "¿Agregas o quitas
    alguno? ¿Hay algo que el bot nunca debe decir o prometer?" [PRD 9 · `prompt.js` parte 5 ·
    palabras sueltas prohibidas a `config.revisor.palabras_prohibidas`]

## H · Cuándo entra una persona  [PRD 10]

15. Lee los casos de pase del archivo del tipo y pregunta: "¿En qué otros casos quieres entrar
    tú?" [PRD 10 · `prompt.js` parte 6]. Dos casos van siempre, en todo negocio, aunque nadie
    los pida: una queja o alguien molesto, y alguien que pide hablar con una persona.
15b. "Si alguien escribe solo 'info' o 'precio' y nada más, ¿qué quieres que le conteste el
    bot?" Recomendado: una pregunta corta para saber qué busca. [PRD 8, otros caminos]
15c. "Si escriben fuera de tu horario, ¿el bot contesta igual, o dice algo distinto?"
    Recomendado: contesta igual, y si hace falta una persona dice que le contestan en horario.
    [PRD 8, otros caminos · `prompt.js`, casos]
16. "¿Quién recibe el aviso cuando el bot pasa una plática, y por dónde: Telegram o correo?"
    Recomendado: Telegram. [PRD 7 y 10 · `config.modulos.aviso`. Si lo reciben varias personas
    (cocina y dueño): un grupo de Telegram con el bot adentro.]
17. "Cuando tú contestas a mano, el bot se calla en esa plática. Lo recomendado son 12 horas, y
    si le escribes a la persona 'te dejo con mi asistente', regresa antes. ¿Lo dejamos así?"
    [PRD 7 · `config.dueno`]
    - Las mismas horas aplican cuando el bot pasa la plática por su cuenta. Si pide "para
      siempre" (`horas_silencio: 0`), dile que entonces una plática que el bot pasó tampoco la
      retoma nunca, salvo que él escriba la frase de regreso. Para un negocio con muchos
      mensajes (un café) puede convenir menos: 2 o 3 horas.
    - La frase de regreso la ve el cliente. Si el negocio habla de usted, propón "le dejo con
      mi asistente". [`config.dueno.frase_regreso`]
18. Propón tres frases para cuando el bot pasa la plática, en el tono de sus mensajes de la
    pregunta 7 (de tú o de usted), por ejemplo "Déjame revisarlo y te contesto en cuanto
    pueda". Que las apruebe o las cambie. No deben prometer un tiempo exacto. Si contesta "no
    sé" o "las que tú digas", se quedan las tres que propusiste: son redacción, no datos del
    negocio, y no se marcan como pendiente. Dilo en la parada. [`config.dueno.frases_pase`]

## I · Lo que guarda  [PRD 11]

19. Propón los datos del archivo del tipo y pregunta: "¿Qué más te sirve saber de cada persona?"
    [`config.datos`: nombres cortos en minúsculas, sin acentos, con guion bajo: `que_busca`]

## J · Ajustes  [PRD 7]

20. No preguntes uno por uno. Enseña este bloque y pregunta si cambia algo:
    - Espera 10 segundos a que la persona termine de escribir (25 como máximo).
    - Máximo 3 mensajes por respuesta, de 300 caracteres cada uno. Una pregunta por respuesta.
    - Si mandan una foto o un audio que no entiende: te avisa.
    - Notas de voz: apagadas. (Préndelas si sus clientes mandan muchos audios.)
    - Precios: lo que diga el archivo del tipo.

## K · Pruebas y lo que queda fuera  [PRD 12 y 13]

21. "Cuéntame un caso raro o difícil que te haya pasado con un cliente por mensaje. ¿Qué
    quieres que haga el bot si vuelve a pasar?" Eso es su prueba propia. [PRD 12 · una plática
    de `test/guiones/` · un caso en `prompt.js`. Si no sabe qué quiere que haga: el bot pasa la
    plática a una persona, y así se escribe.]
22. Si pidió algo de "Lo que esta plantilla no hace", dile cuáles son y cómo se resuelven
    mientras tanto. [PRD 13]

## Cómo llenas cada sección del PRD

- **8. Cómo va una conversación:** el camino ideal lo armas tú con sus respuestas y el camino
  del archivo del tipo, y se lo lees para que lo corrija. Es lo único del PRD que redactas tú.
- **12. Cómo sabemos que funciona:** las pruebas de la plantilla, las del tipo y la suya.
- Todo lo demás son sus respuestas, con sus palabras. Si una sección quedó con una sola línea,
  es una sección floja: dilo en la parada.
