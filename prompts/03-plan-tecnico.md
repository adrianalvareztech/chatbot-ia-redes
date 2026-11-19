# Prompt 03 · El plan

> Este es el camino a mano. La skill `/configurar-bot` hace este mismo paso contigo: te
> pregunta, escribe y se detiene para que revises.

El motor del bot ya viene hecho y probado. El plan dice qué piezas se prenden para tu negocio,
qué va en la configuración y cómo se prueba cada paso.

Activa plan mode antes (Shift+Tab).

```
Lee PRD.md, CLAUDE.md y src/modulos/LEEME.md. Escribe el plan en plan.md:
1. Qué módulos se prenden (sección 7 del PRD) y qué va en src/negocio/config.js, valor por valor.
2. Qué datos faltan (IDs, links, chats) y quién me los tiene que dar.
3. Qué cuentas y llaves necesita este bot, solo las de los módulos prendidos, y dónde se saca
   cada una.
4. Las fases para prenderlo, y qué casos de la sección 12 del PRD se prueban en cada una
   con npm run simular.
No toques src/nucleo/. Si algo del PRD no lo cubre ningún módulo, dímelo antes de proponer
código nuevo. No escribas código todavía.
```

**Antes de aprobarlo, revisa tres cosas:**

1. ¿Cada acción del PRD tiene un módulo o una acción propia con link en el plan? (Agendar,
   tomar pedidos, juntar datos de un interesado, mandar links.)
2. ¿Dice cuántas horas se calla el bot cuando contestas tú y cuál es la frase para regresarle la plática?
3. ¿Cada fase dice qué caso se prueba en el simulador?
