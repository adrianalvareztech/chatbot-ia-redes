// La configuración de TU bot. La escribe Claude Code a partir de PRD.md (sección 7, Módulos).
// Aquí no va ninguna llave: las llaves van en .dev.vars (en tu compu) o como secrets (en la nube).
//
// EJEMPLO: lo que ves es una clínica dental inventada para que la plantilla funcione desde el
// minuto uno. Claude lo reemplaza con los datos de tu negocio.
export default {
  negocio: "Clínica Sonrisa",
  zona_horaria: "America/Mexico_City",
  modelo: "claude-sonnet-5-5",          // con mucho volumen y respuestas simples: "claude-haiku-5-5"

  // Las cuentas de Zernio que atiende este bot. Lo que llegue de cualquier otra cuenta se ignora.
  // El ID sale de Zernio (Accounts) o de: curl -H "Authorization: Bearer $ZERNIO_API_KEY" https://zernio.com/api/v1/accounts
  zernio: { cuentas: ["ID_DE_LA_CUENTA"] },

  modulos: {
    conocimiento: "archivo",            // "archivo" | "notion"
    agenda: "link",                     // "ninguna" | "link" | "cal"
    aviso: "telegram",                  // "ninguno" | "telegram" | "correo"
    voz: false,                         // true = entiende notas de voz
    pedidos: false,                     // true = toma pedidos: arma la orden, suma el total y te avisa
    interesados: false,                 // true = te manda los datos de quien ya está calificado, sin callarse
    enlaces: false,                     // true = puede mandar cualquier link que esté en "Lo que sabe"
  },

  notion: { fuentes: [] },              // ids de página o de base de Notion (si conocimiento = "notion")
  agenda: {
    link: "https://cal.com/TU-USUARIO/TU-CITA",  // si agenda = "link"
    tipo_de_cita: null,                 // id del tipo de cita en Cal.com (si agenda = "cal")
    dias: 7,                            // cuántos días de horarios ofrece (si agenda = "cal")
    avisar: false,                      // true = te avisa a quién le mandó el link y qué sabe de esa persona (si agenda = "link")
  },
  aviso: { telegram_chat: "", correo: "" },

  // Solo si pedidos = true. Lo que se puede pedir y sus precios salen de "Lo que sabe", no de aquí.
  pedidos: {
    moneda: "MXN",
    // Cada forma de entrega: cuánto cuesta y qué datos (de la lista `datos`) pide antes de cerrar.
    entregas: {
      recoger: { costo: 0, pide: ["nombre"] },
      // domicilio: { costo: 35, pide: ["nombre", "direccion", "telefono"], pago: "Pagas en efectivo al recibir." },
      // `pago` es opcional: si esa entrega se paga distinto, va aquí y le gana a pago.texto.
    },
    pago: { texto: "", link: "" },      // lo que el sistema manda al cerrar: cómo se paga y, si hay, el link
    horario: null,                      // null = siempre. O por día: { lunes: "08:00-20:00", sabado: "09:00-14:00" }
    cantidad_maxima: 20,                // más que esto de un mismo artículo pasa al dueño
    piezas_maximas: null,               // más piezas que esto en total (mayoreo) pasa al dueño. null = sin tope
    total_maximo: null,                 // un pedido que sume más que esto pasa al dueño. null = sin tope
  },

  // Solo si interesados = true. Los datos obligatorios antes de avisarte (tienen que estar en `datos`).
  interesados: { campos: ["nombre"] },

  // Acciones propias que solo mandan un link fijo.
  acciones: {
    // mandar_menu: { descripcion: "Cuando pide el menú", link: "https://..." },
  },

  mensajes: { maximo: 3, caracteres: 300, una_pregunta: true },
  espera_segundos: 10,                  // cuánto espera a que la persona termine de escribir
  espera_maxima_segundos: 25,           // nunca espera más que esto desde su primer mensaje
  historial: 30,                        // cuántos mensajes de la plática lee

  dueno: {
    horas_silencio: 12,                 // cuando contestas a mano, el bot se calla estas horas. 0 = para siempre
    frase_regreso: "te dejo con mi asistente",
    frases_pase: [
      "Déjame revisarlo y te contesto en cuanto pueda",
      "Lo reviso y te escribo en un rato",
      "Dame chance de checarlo y te contesto pronto",
    ],
  },

  adjuntos: "avisar",                   // "avisar" | "ignorar" (foto, sticker, audio sin módulo de voz)
  datos: ["nombre", "servicio"],        // lo que se guarda de cada persona (sección 11 del PRD)

  revisor: {
    precios: "conocimiento",            // "conocimiento" = solo los de Lo que sabes | "nunca"
    enlaces: [],                        // links permitidos además de los de Lo que sabes
    palabras_prohibidas: [],
  },
};
