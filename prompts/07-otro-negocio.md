# Prompt 07 · El mismo bot para otro negocio

> Este es el camino a mano. La skill `/configurar-bot` hace este mismo paso contigo: te
> pregunta, escribe y se detiene para que revises.

Haz una copia del proyecto antes, para no tocar el que ya funciona.

```
Vamos a adaptar este chatbot para otro negocio. Entrevístame otra vez con
plantillas/plantilla-prd.md, pero solo para las secciones que cambian: el objetivo, lo que sabe,
las herramientas, los módulos y cuándo pasa a una persona. Actualiza PRD.md y después
src/negocio/ (config.js, prompt.js y conocimiento.md). No toques src/nucleo/. Corre npm test
y dime cómo lo pruebo en el simulador.
```

Con la skill: en la copia, escribe `/configurar-bot otro negocio`.

Lo normal es que solo cambie `src/negocio/`: lo que sabe, el tipo de cita o el link de Cal.com,
y el prompt del bot. El anexo de `plantillas/plantilla-prd.md` tiene ocho tipos de negocio.
