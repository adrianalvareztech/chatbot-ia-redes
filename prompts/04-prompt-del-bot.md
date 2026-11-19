# Prompt 04 · El prompt del bot

> Este es el camino a mano. La skill `/configurar-bot` hace este mismo paso contigo: te
> pregunta, escribe y se detiene para que revises.

El PRD describe el bot para ti y para Claude Code. El prompt del bot es lo que el bot lee
cada vez que alguien le escribe. Claude lo escribe a partir de tu PRD.

```
Lee .claude/skills/configurar-bot/referencias/como-escribir-el-negocio.md y síguelo. Con
plantillas/plantilla-prompt-bot.md, PRD.md y plan.md escribe src/negocio/ (conocimiento.md,
config.js y prompt.js), reemplazando el ejemplo de la clínica, y las pláticas de prueba en
test/guiones/ y test/mi-negocio.test.js. En el prompt escribe las partes 1 a 6; la 7 la arma
el sistema. Lo que el bot sabe (precios, servicios, horarios, links, preguntas frecuentes) no
va en el prompt: va en src/negocio/conocimiento.md. No inventes ningún dato: lo que falte,
márcalo PENDIENTE. Cuando termines, corre npm test, npm run prompt y npm run pendientes,
enséñame el prompt completo en español normal y dime qué decidiste tú que no estaba en el PRD.
```

**Antes de seguir, revisa tres cosas:**

1. ¿La meta es una sola?
2. ¿Cada caso de "cuándo le pasa la plática a una persona" del PRD está en los casos del prompt?
3. ¿Suena a tu negocio? Si no, dile cómo hablas tú, con un ejemplo real.
