/** Los 9 módulos de Aulakium, con la audiencia a la que le aportan valor.
 *  Fuente única para la sección de la landing y la página /ventajas (filtrable). */

export type FeatureAudience = "colegio" | "docentes" | "familias";

export interface Feature {
  key: string;
  title: string;
  text: string;
  icon: string;
  img: string;
  audiences: FeatureAudience[];
}

export const AUDIENCE_LABELS: Record<FeatureAudience, string> = {
  colegio: "Para el colegio",
  docentes: "Para docentes",
  familias: "Para familias",
};

export const AUDIENCE_ICON: Record<FeatureAudience, string> = {
  colegio: "GraduationCap",
  docentes: "Users",
  familias: "HeartHandshake",
};

export const FEATURES: Feature[] = [
  {
    key: "inicio",
    title: "Inicio",
    text: "Un resumen de todo: avisos sin leer, eventos de la semana y solicitudes pendientes, apenas entras.",
    icon: "LayoutGrid",
    img: "/features/1-inicio.webp",
    audiences: ["colegio", "docentes", "familias"],
  },
  {
    key: "avisos",
    title: "Avisos",
    text: "Avisos del colegio con foto, me gusta y comentarios, segmentados por curso.",
    icon: "Megaphone",
    img: "/features/2-comunicados.webp",
    audiences: ["colegio", "docentes", "familias"],
  },
  {
    key: "calendario",
    title: "Calendario",
    text: "Exámenes, eventos y salidas en un calendario claro y compartido.",
    icon: "CalendarDays",
    img: "/features/3-calendario.webp",
    audiences: ["colegio", "docentes", "familias"],
  },
  {
    key: "mensajes",
    title: "Mensajes",
    text: "Conversaciones entre familias y docentes, siempre dentro de cada salón.",
    icon: "MessagesSquare",
    img: "/features/4-mensajes.webp",
    audiences: ["docentes", "familias"],
  },
  {
    key: "solicitudes",
    title: "Solicitudes",
    text: "Inasistencias, autorizaciones y comprobantes, sin papeles.",
    icon: "ClipboardList",
    img: "/features/5-tramites.webp",
    audiences: ["colegio", "docentes", "familias"],
  },
  {
    key: "documentos",
    title: "Documentos",
    text: "Circulares y archivos del colegio, y boletines privados que cada familia ve solo los suyos.",
    icon: "FolderClosed",
    img: "/features/6-documentos.webp",
    audiences: ["colegio", "docentes", "familias"],
  },
  {
    key: "transporte",
    title: "Transporte",
    text: "Sigue el transporte escolar en el mapa, con avisos de subida y bajada.",
    icon: "Bus",
    img: "/features/7-transporte.webp",
    audiences: ["colegio", "familias"],
  },
  {
    key: "traduccion",
    title: "Traducción",
    text: "Cada familia lee los avisos en su idioma, con un solo toque.",
    icon: "Languages",
    img: "/features/8-traduccion.webp",
    audiences: ["familias"],
  },
  {
    key: "pagos",
    title: "Pagos",
    text: "El comprobante de la cuota de cada mes, y las familias suben su pago.",
    icon: "CreditCard",
    img: "/features/9-pagos.webp",
    audiences: ["colegio", "familias"],
  },
];
