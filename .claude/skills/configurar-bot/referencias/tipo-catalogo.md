# Tipo · Catálogo que califica

Inmobiliaria, autos, agencia de viajes, salones de eventos. Muchas opciones, compra cara, y
antes de cerrar la persona habla con un asesor. El bot contesta sobre las opciones, entiende
qué busca y le pasa una persona lista para atender.

**Meta del bot:** juntar los datos de la persona y pasárselos al asesor. Si el negocio agenda
visitas con link, la meta es agendar la visita.

## Preguntas de "Lo que sabe" (bloque E)

1. "¿Cuántas opciones tienes publicadas hoy (propiedades, autos, paquetes)?"
   - Hasta unas 150: caben. Más: explícale el punto 6 de "Lo que esta plantilla no hace" y
     pregunta cuáles cargar (las vigentes, las destacadas). Anótalo en PRD 13.
2. "Pásame la lista con lo que la gente pregunta de cada una: zona, precio, tamaño, y su link
   con fotos." [`conocimiento.md`, un renglón por opción con su link. Lo que no traiga link no
   tiene link: no se inventa uno.]
3. "¿Cada cuánto cambia esa lista y quién la cambia? ¿Dónde la llevan hoy?" [Si cambia cada
   semana: Notion. Si ya la llevan en Notion, el bot lee esa misma base con las columnas que
   tenga; solo hace falta que cada opción traiga su link completo. Si no existe, una base con
   las columnas de lo que la gente pregunta: `Nombre`, `Operación`, `Zona`, `Precio`,
   `Recámaras`, `Link`.]
4. "¿Qué preguntan siempre que no depende de una opción en especial?" (créditos, requisitos,
   comisiones, apartado). Pide la respuesta. [`conocimiento.md`]

## Preguntas de "Lo que puede hacer" (bloque F)

5. "¿Qué necesita saber tu asesor para atender bien a alguien?" Recomendado en inmobiliaria: si
   compra o renta, zona, presupuesto y teléfono. [`config.interesados.campos` · `config.datos`]
6. "Cuando ya tiene esos datos, ¿qué sigue: lo contacta un asesor, o la persona agenda una
   visita ella sola?"
   - Lo contacta un asesor: `modulos.interesados: true`, `agenda: "ninguna"`.
   - Agenda sola y hay un link de Cal.com: `agenda: "link"` y `agenda.avisar: true`.
7. "¿En cuánto tiempo contacta el asesor?" [`conocimiento.md`, solo si lo dice. Si no, el bot
   no promete tiempo.]
8. "¿Puede el bot decir precios?" [`config.revisor.precios`. Si dice que no: `"nunca"`.]

## Lo que nunca hace (léeselo en el bloque G)

- Inventar una opción, un precio o una disponibilidad.
- Decir que algo sigue disponible si "Lo que sabe" no lo dice.
- Negociar precio, apartar o prometer un crédito.
- Dar asesoría legal o fiscal.

## Cuándo pasa a una persona (léeselo en el bloque H)

- Quiere hacer una oferta, negociar o apartar.
- Pregunta por créditos o trámites que no están en "Lo que sabe".
- Busca algo que no está en la lista, o pregunta por una opción que ya no aparece (una
  publicación vieja): el bot dice que esa ya no está en la lista y ofrece ver las vigentes.
- Una queja, o pide hablar con una persona.
- Es dueño y quiere vender o rentar con el negocio (otro tipo de cliente).

## Así queda

| Qué | Valor |
|---|---|
| `modulos.interesados` | `true`, con `campos` de la pregunta 5 |
| `modulos.enlaces` | `true` si las opciones tienen link |
| `modulos.agenda` | `"ninguna"`, o `"link"` si agenda visitas sola |
| `modulos.conocimiento` | `"notion"` si la lista cambia seguido; si no, `"archivo"` |
| `modulos.aviso` | `"telegram"` (obligatorio) |
| `datos` | los de la pregunta 5, por ejemplo `["nombre", "operacion", "zona", "presupuesto", "telefono"]` |

## El camino, para el prompt

1. Qué busca (la primera pregunta de la lista de la pregunta 5).
2. Los demás datos, uno por mensaje, mezclados con respuestas útiles: si ya dijo zona y
   presupuesto, cuéntale una o dos opciones de "Lo que sabes" que le queden.
3. Si quiere ver una opción: acción mandar_link con su link.
4. Cuando ya tienes los datos obligatorios: acción registrar_interesado, y le dices que un
   asesor lo contacta.
5. Si después sigue preguntando, sigues contestando.

## Formato de "Lo que sabe"

Un renglón por opción, con su link completo:

```
| Nombre | Operación | Zona | Precio | Recámaras | Link |
|---|---|---|---|---|---|
| Casa Las Palmas | Venta | Playas | $4,500,000 | 3 | https://inmo.com/las-palmas |
```

## Pláticas de prueba

1. `camino-ideal.txt`: dice qué busca, da sus datos, queda registrado.
2. `02-ver-opcion.txt`: pide ver una opción y recibe su link.
3. `03-no-hay.txt`: busca algo que no está en la lista. No inventa.
4. `04-oferta.txt`: quiere hacer una oferta. Pasa a una persona.
5. `05-dueno-y-regreso.txt`: `/dueno` y `/regreso`.
