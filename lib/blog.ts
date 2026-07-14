// Contenido del blog "Ideas para tu comunidad".
// Artículos completos con página propia (/blog/[slug]). Las fotos de portada
// las provee el colegio/marketing en /public/blog/<slug>.webp (ver lista).

export interface BlogSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  date: string; // etiqueta visible
  readMins: number;
  cover: string; // /blog/<slug>.webp
  hasCover?: boolean; // true cuando ya existe la foto real (si no, gradiente)
  coverAlt: string;
  lead: string;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "entregar-boletines-sin-mensajes-uno-por-uno",
    tag: "Gestión",
    title: "Cómo entregar los boletines sin mandarle un mensaje a cada familia",
    excerpt:
      "Subir todos los boletines juntos y que cada familia vea únicamente el de su hijo. Menos trabajo para el colegio, más privacidad para las familias.",
    date: "13 jul 2026",
    readMins: 4,
    cover: "/blog/entregar-boletines-sin-mensajes-uno-por-uno.webp",
    hasCover: true,
    coverAlt: "Una docente trabaja en su escritorio rodeada de papeles y listados impresos",
    lead: "Fin de trimestre y la misma escena de siempre: alguien de administración abriendo conversación por conversación para adjuntarle a cada familia el boletín de su hijo, con cuidado de no equivocarse de archivo. Es lento, es tedioso y un error se paga caro. Hay una forma mejor.",
    sections: [
      {
        heading: "El problema no es el boletín, es la entrega",
        paragraphs: [
          "Preparar las calificaciones es trabajo del equipo docente. Pero entregarlas suele caer en un cuello de botella: mandar un archivo distinto a cada familia, uno por uno, por mensaje privado. Con treinta familias por salón, son cientos de envíos manuales cada cierre de trimestre.",
          "Y como es dato sensible de un menor, no puedes mandarlo a un grupo ni equivocarte de destinatario. Así que además de lento, es un trabajo que exige concentración total, justo cuando el equipo tiene mil cosas encima.",
        ],
      },
      {
        heading: "La idea: subir todo junto, que cada quien vea lo suyo",
        paragraphs: [
          "La alternativa es simple: subes todos los boletines de una vez y la plataforma los reparte sola, dejando cada archivo visible únicamente para la familia del alumno que corresponde. No hay conversación por conversación ni riesgo de mandarle el boletín de un chico a otra familia.",
          "Del lado de la familia, el boletín aparece en un solo lugar —junto al resto de los documentos del colegio— con una etiqueta de privado. Cada familia ve el de sus hijos, y nada más.",
        ],
      },
      {
        heading: "Por qué la privacidad no es un detalle",
        paragraphs: [
          "Las calificaciones son de las cosas más sensibles que maneja un colegio. Que la boleta de un alumno termine, aunque sea por error, en la pantalla de otra familia es un problema serio: de confianza con las familias y, en muchos países, también legal.",
          "Por eso la regla debería ser “cada familia ve solo lo de sus hijos” por diseño, no por cuidado manual. La tecnología se encarga de que ese error simplemente no pueda ocurrir.",
        ],
      },
      {
        heading: "Menos tarea administrativa, la misma prolijidad",
        paragraphs: [
          "El resultado es doble: el colegio se ahorra horas de trabajo repetitivo en cada cierre, y las familias reciben la información clara, ordenada y a tiempo, sin depender de que alguien recuerde adjuntar el archivo correcto.",
          "Y como todo queda guardado en el mismo espacio de documentos, cuando una familia necesita el boletín del trimestre pasado, lo encuentra sin tener que pedirlo.",
        ],
      },
      {
        paragraphs: [
          "Entregar las calificaciones no debería ser una tarea de resistencia. Subes los archivos una vez, la plataforma hace el reparto y la privacidad viene incluida. El equipo se dedica a lo que importa —acompañar el aprendizaje— y no a pelear con adjuntos.",
        ],
      },
    ],
  },
  {
    slug: "que-las-familias-lean-tus-avisos",
    tag: "Comunidad",
    title: "5 ideas para que las familias lean (de verdad) tus avisos",
    excerpt:
      "Títulos claros, un solo canal y el mensaje correcto a la familia correcta. Pequeños cambios que suben muchísimo la lectura.",
    date: "10 jun 2026",
    readMins: 4,
    cover: "/blog/que-las-familias-lean-tus-avisos.webp",
    hasCover: true,
    coverAlt: "Una familia revisa el aviso del colegio desde el teléfono",
    lead: "Mandar el aviso es la mitad del trabajo. La otra mitad es que llegue, se entienda y alguien haga algo con él. Estas cinco ideas no cambian lo que comunicás, sino cómo lo comunicás, y mueven mucho la aguja.",
    sections: [
      {
        heading: "1. Que el título diga lo esencial",
        paragraphs: [
          "La mayoría de las familias decide si abre o no un aviso solo con el título. Si dice “Comunicado N° 14”, compite con todo lo demás del día y pierde. Si dice “Mañana no hay clases por jornada docente”, ya cumplió su función incluso sin que lo abran.",
          "Escribe el título como si fuera lo único que se va a leer: qué pasa, a quién afecta y cuándo.",
        ],
      },
      {
        heading: "2. Un solo canal oficial",
        paragraphs: [
          "Cuando la info importante vive en cinco lugares —el cuaderno, el mail, dos grupos de WhatsApp y la cartelera— las familias dejan de saber dónde mirar, y el colegio termina repitiendo todo en todos lados.",
          "Define un único canal oficial y comunícalo: “lo importante siempre está aquí”. Menos esfuerzo para el colegio, menos excusas de “no me enteré”.",
        ],
      },
      {
        heading: "3. El mensaje correcto a la familia correcta",
        paragraphs: [
          "Un aviso de 3°B que le llega a todo el colegio entrena a la gente a ignorar los avisos. Cuando cada familia recibe solo lo que le corresponde, cada notificación vuelve a ser relevante y se abre.",
          "Segmenta por nivel, grado, salón o rol. La regla es simple: si no es para esta familia, no se lo mandes.",
        ],
      },
      {
        heading: "4. El momento justo",
        paragraphs: [
          "Un aviso de algo que es a las 8 de la mañana, enviado a las 7:50, ya llegó tarde para la mitad. Avisa con anticipación lo planificable y reserva el “ahora mismo” para lo urgente de verdad.",
        ],
      },
      {
        heading: "5. Pide una acción clara",
        paragraphs: [
          "Si esperas algo de la familia —confirmar asistencia, firmar una autorización, mandar un dato— pídelo de forma explícita y ofrécele un botón para hacerlo. Y usa los indicadores de leído para saber a quién recordarle, en vez de reenviar a todos.",
        ],
      },
      {
        paragraphs: [
          "Ninguna de estas ideas requiere comunicar más: requieren comunicar mejor. Empieza por una sola —el título— y vas a ver el cambio en la primera semana.",
        ],
      },
    ],
  },
  {
    slug: "armar-el-calendario-del-trimestre",
    tag: "Gestión",
    title: "Cómo armar el calendario del trimestre sin estrés",
    excerpt:
      "Exámenes, actos y salidas en un solo calendario compartido, para que nadie se entere tarde de una fecha importante.",
    date: "03 jun 2026",
    readMins: 5,
    cover: "/blog/armar-el-calendario-del-trimestre.webp",
    hasCover: true,
    coverAlt: "Calendario escolar con eventos del trimestre",
    lead: "El calendario es el corazón de la organización escolar, pero suele armarse a las apuradas y vivir en una planilla que pocos miran. Con un poco de método deja de ser una fuente de sorpresas de último momento.",
    sections: [
      {
        heading: "Empieza por las fechas fijas",
        paragraphs: [
          "Antes de pensar en lo nuevo, cargá lo que ya está definido: feriados, vacaciones, actos institucionales y períodos de evaluación. Esas fechas son el esqueleto; todo lo demás se acomoda alrededor.",
        ],
      },
      {
        heading: "Un calendario, varias capas",
        paragraphs: [
          "No todo es para todos. Lo institucional convive con lo de cada nivel y lo de cada salón. La clave es que sea un mismo calendario con capas, no calendarios separados que después nadie cruza.",
        ],
        list: [
          "Institucional: actos, reuniones generales, feriados.",
          "Por nivel: campañas, salidas, evaluaciones del ciclo.",
          "Por salón: entregas, cumpleaños, actividades del grupo.",
        ],
      },
      {
        heading: "Avisa con anticipación y recuerda cerca",
        paragraphs: [
          "Cada fecha importante necesita dos toques: uno cuando se publica (para que la familia se organice) y un recordatorio cerca del día (para que no se le pase). Un evento bien cargado puede disparar ambos solo.",
        ],
      },
      {
        heading: "Evitá los choques de fechas",
        paragraphs: [
          "La muestra de arte el mismo día que la evaluación de matemática genera quejas y ausencias. Tener todo el trimestre a la vista, en un solo lugar, hace que esos choques se vean antes de que sean un problema.",
        ],
      },
      {
        paragraphs: [
          "Un calendario compartido y bien mantenido reemplaza decenas de avisos sueltos y de “¿cuándo era?”. Es trabajo al inicio del trimestre que se paga solo durante las semanas siguientes.",
        ],
      },
    ],
  },
  {
    slug: "adios-a-los-grupos-de-whatsapp",
    tag: "Tecnología",
    title: "Adiós a los grupos de WhatsApp del colegio",
    excerpt:
      "Por qué el chat informal genera ruido y desigualdad, y cómo un canal oficial ordena la comunicación y cuida la privacidad.",
    date: "28 may 2026",
    readMins: 5,
    cover: "/blog/adios-a-los-grupos-de-whatsapp.webp",
    hasCover: true,
    coverAlt: "Teléfono con muchos mensajes de un grupo de chat",
    lead: "Los grupos de WhatsApp aparecieron para resolver un problema real: comunicarse rápido. Pero con el tiempo crean otros más grandes. No se trata de prohibirlos, sino de devolverle al colegio un canal que sea suyo.",
    sections: [
      {
        heading: "El problema del ruido",
        paragraphs: [
          "En un grupo de 30 familias, el aviso importante de la maestra queda enterrado entre stickers, “gracias!” y debates sobre el regalo de fin de año. La información que importa compite con todo lo demás, y casi siempre pierde.",
        ],
      },
      {
        heading: "Privacidad y datos de menores",
        paragraphs: [
          "Un grupo expone el teléfono de todas las familias a todas las familias, y muchas veces circulan fotos de chicos sin que nadie haya dado permiso. Para una institución, eso es un riesgo concreto sobre datos de menores que conviene no tener.",
        ],
      },
      {
        heading: "La desigualdad de la información",
        paragraphs: [
          "Quien silencia el grupo —o se suma tarde— se pierde cosas. La información oficial no debería depender de estar atento a un chat a las 11 de la noche. Debería estar disponible, ordenada y buscable cuando la familia la necesite.",
        ],
      },
      {
        heading: "Qué reemplaza al grupo",
        paragraphs: [
          "Un canal oficial del colegio cambia las reglas: el colegio comunica de forma clara y segmentada, las familias responden cuando hace falta, y todo queda ordenado y con privacidad por diseño. El chat informal puede seguir existiendo para lo social; lo importante deja de vivir ahí.",
        ],
      },
      {
        paragraphs: [
          "El objetivo no es quitarle el teléfono a nadie, sino que ninguna familia vuelva a enterarse tarde de algo importante por no haber leído un grupo a tiempo.",
        ],
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
