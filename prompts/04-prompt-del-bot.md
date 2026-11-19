# Prompt 04 · El prompt del bot

El PRD describe el bot para ti y para Claude Code. El prompt del bot es lo que el bot lee
cada vez que alguien le escribe. Claude lo escribe a partir de tu PRD.

```
Usa plantillas/plantilla-prompt-bot.md y PRD.md para escribir el prompt del bot en
src/negocio/prompt.js. Reemplaza el ejemplo de la clínica que viene ahí. Escribe las partes
1 a 6; la 7 la arma el sistema. Lo que el bot sabe (precios, servicios, horarios, links,
preguntas frecuentes) no va en el prompt: va en src/negocio/conocimiento.md, o en Notion si
así lo dice el PRD. Cuando termines, corre npm test y npm run prompt, enséñame el prompt
completo en español normal y dime qué decidiste tú que no estaba en el PRD.
```

**Antes de seguir, revisa tres cosas:**

1. ¿La meta es una sola?
2. ¿Cada caso de "cuándo le pasa la plática a una persona" del PRD está en los casos del prompt?
3. ¿Suena a tu negocio? Si no, dile cómo hablas tú, con un ejemplo real.
