# Prompt 06 · Subirlo y conectarlo

Las llaves nunca se pegan en el chat. Claude te da un comando por llave; tú lo corres
escribiendo `!` antes (por ejemplo `! npx wrangler secret put ZERNIO_API_KEY`) y pegas la
llave cuando la terminal te la pida.

```
Vamos a subir el bot. Paso por paso, esperando mi confirmación en cada uno:
1. Dame el comando para iniciar sesión en Cloudflare y el de npx wrangler d1 create chatbot,
   para que yo los corra con !. Pon en wrangler.toml el database_id que salga.
2. Revisa que wrangler.toml diga MODO = "solo-avisos" y que src/negocio/config.js tenga el ID
   de mi cuenta de Zernio.
3. Dame un comando de wrangler secret put por cada llave que usa el bot (según los módulos
   prendidos) y espera a que yo los corra con !. No escribas ninguna llave en un archivo.
4. Corre npm run deploy y abre /salud para confirmar que no falta ninguna llave.
5. Dame el comando npm run webhook -- crear con la URL del Worker, para que yo lo corra con !.
6. Sube el código a mi repositorio privado de GitHub.
```

**La prueba, en dos vueltas:**

1. **Solo avisos.** Desde otra cuenta, mándale un mensaje a la tuya. El bot no contesta: te
   llega un aviso con lo que contestaría. Prueba varios casos hasta que te guste.
2. **Encendido.** Cambia `MODO = "encendido"` en `wrangler.toml` y vuelve a subir con
   `npm run deploy`. Escríbele otra vez: el bot contesta. Luego contesta tú a mano desde la
   app: el bot ya no se mete en esa conversación.
