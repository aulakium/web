/**
 * Modelo de dominio (subconjunto para el prototipo del Muro) + datos mock.
 * Alineado con docs/ARQUITECTURA.md: roles con scope, audiencias polimórficas.
 * Cuando conectemos Supabase, estos tipos se mapean 1:1 a las tablas.
 */

export type RoleKey =
  | "board"
  | "manager"
  | "principal"
  | "department_head"
  | "coordinator"
  | "support_staff"
  | "teacher"
  | "service_inbox"
  | "guardian"
  | "student"
  | "driver";

export type RoleKind = "staff" | "family" | "service" | "student" | "driver";

export const ROLE_LABELS: Record<RoleKey, string> = {
  board: "Consejo de Administración",
  manager: "Gerencia",
  principal: "Dirección",
  department_head: "Jefatura de Dpto.",
  coordinator: "Coordinación",
  support_staff: "Equipo de Apoyo",
  teacher: "Docente",
  service_inbox: "Área de servicio",
  guardian: "Adulto responsable",
  student: "Alumno/a",
  driver: "Chofer",
};

/** Audiencia polimórfica (ver §4.2). El feed = unión de lo publicado a audiencias del usuario. */
export type AudienceTarget =
  | "community"
  | "level"
  | "grade"
  | "group"
  | "role"
  | "user";

export interface Audience {
  target: AudienceTarget;
  label: string; // etiqueta visible, ej. "6°B", "Primaria", "Toda la comunidad"
}

export interface Author {
  name: string;
  role: RoleKey;
  color: string; // color del avatar (token tailwind, ej. "brand")
}

export interface Post {
  id: string;
  author: Author;
  audience: Audience;
  publishedAt: string; // etiqueta relativa para la demo
  title: string;
  body: string;
  image?: string; // foto de portada (subida por quien publica); si falta, se usa el gradiente
  cover: string; // gradiente de portada (fallback cuando no hay foto)
  coverIcon: "calendar" | "megaphone" | "image" | "trophy" | "bus" | "heart";
  kind?: "announcement" | "poll" | "event" | "task";
  // Invitación (kind="event"): lugar + fecha del evento.
  eventLocation?: string;
  eventAt?: string; // ISO
  // Tarea (kind="task"): acción requerida + si ya la completé.
  taskAction?: "sign" | "submit" | "complete";
  taskDue?: string; // ISO, opcional
  taskDone?: boolean;
  commentsEnabled?: boolean; // el colegio puede desactivar comentarios por aviso
  likes: number;
  comments: number;
  views?: number; // cuántas personas la abrieron/leyeron
  liked: boolean;
  bookmarked: boolean;
  unread: boolean;
  pinned?: boolean;
}

export interface NavItemDef {
  key: string; // clave i18n, ej. "nav.wall"
  href: string;
  icon: string; // nombre del icono lucide
  badge?: number;
  disabled?: boolean; // se muestra en gris, no navegable (módulo aún no habilitado)
  staffOnly?: boolean; // solo docentes y dirección/gestión
}

export interface CurrentUser {
  name: string;
  role: RoleKey;
  roleScope: string; // ej. "Tutora de 6°B"
  color: string;
}

export interface School {
  name: string;
  shortName: string;
  country: string;
}

export interface EventItem {
  id: string;
  day: string; // "12"
  month: string; // "JUN"
  title: string;
  time: string;
  accent: string; // token de color
}

export interface TaskItem {
  id: string;
  title: string;
  due: string;
  group: string;
  done: boolean;
}

/* ============================ DATOS MOCK ============================ */

export const DEMO_SCHOOL: School = {
  name: "Colegio Las Lomas",
  shortName: "Las Lomas",
  country: "MX",
};

export const DEMO_USER: CurrentUser = {
  name: "Valentina Ríos",
  role: "teacher",
  roleScope: "Tutora de 6°B",
  color: "brand",
};

/** Rutas que el rol alumno NO ve (vista acotada). */
export const STUDENT_HIDDEN = ["/conversaciones", "/tramites", "/comunidad"];

/**
 * La sección "Trámites" se llama distinto según el rol para que quede claro:
 * docentes/dirección → "Tareas"; familias → "Pendientes"; resto → "Trámites".
 */
export function requestsNavKey(roleKey: RoleKey | null): string {
  if (roleKey === "guardian") return "nav.requests.pending";
  if (
    roleKey &&
    ["teacher", "principal", "coordinator", "manager", "board", "department_head", "support_staff"].includes(
      roleKey,
    )
  ) {
    return "nav.requests.tasks";
  }
  return "nav.requests";
}

export const NAV_ITEMS: NavItemDef[] = [
  { key: "nav.home", href: "/inicio", icon: "LayoutGrid" },
  { key: "nav.wall", href: "/muro", icon: "Megaphone", badge: 3 },
  { key: "nav.calendar", href: "/calendario", icon: "CalendarDays" },
  { key: "nav.conversations", href: "/conversaciones", icon: "MessagesSquare", badge: 5 },
  { key: "nav.requests", href: "/tramites", icon: "ClipboardList" },
  { key: "nav.payments", href: "/pagos", icon: "CreditCard" },
  { key: "nav.exits", href: "/salidas", icon: "DoorOpen", staffOnly: true },
  { key: "nav.documents", href: "/documentos", icon: "FolderClosed" },
  { key: "nav.transport", href: "/transporte", icon: "Bus" },
  { key: "nav.people", href: "/comunidad", icon: "Users" },
];

export const DEMO_POSTS: Post[] = [
  {
    id: "p1",
    author: { name: "Dirección General", role: "principal", color: "navy" },
    audience: { target: "community", label: "Toda la comunidad" },
    publishedAt: "Hace 2 h",
    title: "Jornada de puertas abiertas — Sábado 14 de junio",
    body: "Invitamos a todas las familias a recorrer el colegio, conocer los proyectos del año y compartir una mañana con los equipos docentes. Habrá actividades para los más chicos en el patio central y café para acompañar las charlas por nivel.",
    cover: "from-brand to-brand-soft",
    coverIcon: "megaphone",
    likes: 48,
    comments: 12,
    liked: true,
    bookmarked: false,
    unread: true,
    pinned: true,
  },
  {
    id: "p2",
    author: { name: "Valentina Ríos", role: "teacher", color: "brand" },
    audience: { target: "group", label: "6°B" },
    publishedAt: "Hace 5 h",
    title: "Salida didáctica al Museo de Ciencias 🔬",
    body: "El próximo jueves visitamos el Museo de Ciencias Naturales. Recuerden enviar la autorización firmada y vestir el equipo de educación física. Salimos 8:30 en punto y volvemos antes del almuerzo.",
    cover: "from-brand to-sky",
    coverIcon: "image",
    likes: 21,
    comments: 7,
    liked: false,
    bookmarked: true,
    unread: true,
  },
  {
    id: "p3",
    author: { name: "Coordinación Primaria", role: "coordinator", color: "sky" },
    audience: { target: "level", label: "Primaria" },
    publishedAt: "Ayer",
    title: "Resultados de la feria del libro",
    body: "¡Gracias a todas las familias que se sumaron! Entre todos juntamos más de 300 libros para la biblioteca. Compartimos algunas fotos de la jornada y los ganadores del concurso de lectura.",
    cover: "from-brand to-sky",
    coverIcon: "trophy",
    likes: 64,
    comments: 18,
    liked: true,
    bookmarked: false,
    unread: false,
  },
  {
    id: "p4",
    author: { name: "Transporte Escolar", role: "support_staff", color: "requests" },
    audience: { target: "role", label: "Familias con transporte" },
    publishedAt: "Hace 2 días",
    title: "Nuevo recorrido de la ruta 14",
    body: "A partir del lunes, la ruta 14 incorpora dos paradas nuevas en el barrio Norte. Puedes ver el recorrido actualizado y el horario estimado de cada parada desde la sección de Transporte.",
    cover: "from-sky to-brand",
    coverIcon: "bus",
    likes: 9,
    comments: 3,
    liked: false,
    bookmarked: false,
    unread: false,
  },
];

export const DEMO_EVENTS: EventItem[] = [
  { id: "e1", day: "12", month: "JUN", title: "Evaluación 2º trimestre", time: "Todo el día", accent: "news" },
  { id: "e2", day: "14", month: "JUN", title: "Puertas abiertas", time: "09:00 – 12:00", accent: "brand" },
  { id: "e3", day: "19", month: "JUN", title: "Reunión de padres 6°B", time: "18:30", accent: "sky" },
  { id: "e4", day: "21", month: "JUN", title: "Receso de invierno", time: "Todo el día", accent: "requests" },
];

export const DEMO_TASKS: TaskItem[] = [
  { id: "t1", title: "Entregar autorización del museo", due: "Vence jueves", group: "6°B", done: false },
  { id: "t2", title: "Firmar boletín del trimestre", due: "Vence 18/06", group: "6°B", done: false },
  { id: "t3", title: "Traer materiales de arte", due: "Vence 20/06", group: "6°B", done: true },
];

/* ============================ CALENDARIO ============================ */

/** Sub-calendarios por nivel/área (ver §8): el usuario ve la unión y puede filtrar. */
export interface DemoCalendar {
  id: string;
  name: string;
  color: string; // token AccentColor
}

export const DEMO_CALENDARS: DemoCalendar[] = [
  { id: "inst", name: "Institucional", color: "navy" },
  { id: "primaria", name: "Primaria", color: "brand" },
  { id: "6b", name: "6°B", color: "sky" },
  { id: "exams", name: "Evaluaciones", color: "news" },
  { id: "transport", name: "Transporte", color: "transport" },
];

/**
 * Evento o tarea del calendario. Para la demo se ancla a JUNIO 2026.
 * `kind` distingue evento de tarea (la tarea se "tacha" al completar, §8).
 */
export interface CalEvent {
  id: string;
  calendarId: string;
  day: number; // día de junio 2026
  allDay: boolean;
  time?: string; // "09:00" si tiene hora
  endTime?: string;
  title: string;
  audienceLabel: string;
  kind: "event" | "task";
  unread?: boolean;
}

/** "Hoy" para la demo (coincide con currentDate del proyecto). Junio = mes 5 (0-based). */
export const DEMO_TODAY = { year: 2026, month: 5, day: 9 };

export const DEMO_CAL_EVENTS: CalEvent[] = [
  { id: "c1", calendarId: "inst", day: 5, allDay: false, time: "09:00", endTime: "10:30", title: "Coffee Morning de familias", audienceLabel: "Toda la comunidad", kind: "event" },
  { id: "c2", calendarId: "6b", day: 9, allDay: false, time: "08:30", endTime: "12:00", title: "Salida al Museo de Ciencias", audienceLabel: "6°B", kind: "event", unread: true },
  { id: "c3", calendarId: "6b", day: 9, allDay: true, title: "Entregar autorización del museo", audienceLabel: "6°B", kind: "task", unread: true },
  { id: "c4", calendarId: "exams", day: 12, allDay: true, title: "Evaluación 2º trimestre", audienceLabel: "Primaria", kind: "event", unread: true },
  { id: "c5", calendarId: "exams", day: 13, allDay: true, title: "Evaluación 2º trimestre", audienceLabel: "Primaria", kind: "event" },
  { id: "c6", calendarId: "inst", day: 14, allDay: false, time: "09:00", endTime: "12:00", title: "Jornada de puertas abiertas", audienceLabel: "Toda la comunidad", kind: "event", unread: true },
  { id: "c7", calendarId: "transport", day: 15, allDay: true, title: "Nuevo recorrido ruta 14", audienceLabel: "Familias con transporte", kind: "event" },
  { id: "c8", calendarId: "primaria", day: 17, allDay: false, time: "10:00", endTime: "11:00", title: "Acto del Día de la Bandera", audienceLabel: "Primaria", kind: "event" },
  { id: "c9", calendarId: "6b", day: 18, allDay: true, title: "Firmar boletín del trimestre", audienceLabel: "6°B", kind: "task" },
  { id: "c10", calendarId: "6b", day: 19, allDay: false, time: "18:30", endTime: "20:00", title: "Reunión de padres 6°B", audienceLabel: "Familias de 6°B", kind: "event", unread: true },
  { id: "c11", calendarId: "primaria", day: 20, allDay: false, time: "09:00", endTime: "13:00", title: "Feria de ciencias", audienceLabel: "Primaria", kind: "event" },
  { id: "c12", calendarId: "inst", day: 21, allDay: true, title: "Inicio receso de invierno", audienceLabel: "Toda la comunidad", kind: "event" },
  { id: "c13", calendarId: "6b", day: 25, allDay: false, time: "08:00", endTime: "12:00", title: "Taller de arte y reciclaje", audienceLabel: "6°B", kind: "event" },
  { id: "c14", calendarId: "exams", day: 26, allDay: true, title: "Entrega de boletines", audienceLabel: "Primaria", kind: "event" },
];

/* ========================= CONVERSACIONES =========================
 * Hilos tipo email entre participantes. REGLA DE PRIVACIDAD (§3.3):
 * una familia sólo ve/escribe sobre los grupos/docentes de SUS hijos;
 * un docente sólo a sus grupos. El `scopeLabel` indica el grupo del hilo.
 */
export interface ChatMessage {
  id: string;
  sender: Author;
  body: string;
  at: string; // etiqueta relativa demo
  mine?: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  scopeLabel: string; // grupo/ámbito del hilo (ej. "6°B")
  participants: Author[];
  labels: string[];
  status: "open" | "closed";
  preview: string;
  lastAt: string;
  unread: number;
  messages: ChatMessage[];
}

const TEACHER: Author = { name: "Valentina Ríos", role: "teacher", color: "brand" };

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "cv1",
    subject: "Autorización salida al museo",
    scopeLabel: "6°B",
    participants: [
      { name: "Marina López", role: "guardian", color: "news" },
      TEACHER,
    ],
    labels: ["Salidas"],
    status: "open",
    preview: "Perfecto, ya envié la autorización firmada. ¡Gracias!",
    lastAt: "10:24",
    unread: 2,
    messages: [
      { id: "m1", sender: TEACHER, body: "Hola Marina, te recuerdo que el jueves es la salida al Museo de Ciencias. Necesito la autorización firmada antes del miércoles.", at: "Ayer 16:10" },
      { id: "m2", sender: { name: "Marina López", role: "guardian", color: "news" }, body: "¡Hola Valentina! Sí, la completo hoy y la subo.", at: "Ayer 18:02" },
      { id: "m3", sender: { name: "Marina López", role: "guardian", color: "news" }, body: "Perfecto, ya envié la autorización firmada. ¡Gracias!", at: "10:24" },
    ],
  },
  {
    id: "cv2",
    subject: "Consulta sobre el boletín del trimestre",
    scopeLabel: "6°B",
    participants: [
      { name: "Jorge Méndez", role: "guardian", color: "sky" },
      TEACHER,
    ],
    labels: ["Académico"],
    status: "open",
    preview: "Te escribo para coordinar una reunión y ver cómo viene Tomás…",
    lastAt: "Ayer",
    unread: 0,
    messages: [
      { id: "m1", sender: { name: "Jorge Méndez", role: "guardian", color: "sky" }, body: "Hola Valentina, te escribo para coordinar una reunión y ver cómo viene Tomás en matemática.", at: "Ayer 09:15" },
      { id: "m2", sender: TEACHER, body: "Hola Jorge, con gusto. ¿Te sirve el martes a las 18:00?", at: "Ayer 11:40", mine: true },
    ],
  },
  {
    id: "cv3",
    subject: "Coordinación acto Día de la Bandera",
    scopeLabel: "Primaria",
    participants: [
      { name: "Coordinación Primaria", role: "coordinator", color: "sky" },
      TEACHER,
    ],
    labels: ["Eventos", "Coordinación"],
    status: "open",
    preview: "Recuerden que ensayamos el lunes en el SUM a las 10.",
    lastAt: "Lun",
    unread: 1,
    messages: [
      { id: "m1", sender: { name: "Coordinación Primaria", role: "coordinator", color: "sky" }, body: "Equipo, recuerden que ensayamos el lunes en el SUM a las 10.", at: "Lun 08:00" },
    ],
  },
  {
    id: "cv4",
    subject: "Reintegro viaje de estudios",
    scopeLabel: "6°B",
    participants: [
      { name: "Administración", role: "support_staff", color: "navy" },
      TEACHER,
    ],
    labels: ["Administrativo"],
    status: "closed",
    preview: "Listo, el reintegro fue procesado. Cerramos el tema.",
    lastAt: "02/06",
    unread: 0,
    messages: [
      { id: "m1", sender: { name: "Administración", role: "support_staff", color: "navy" }, body: "Listo, el reintegro fue procesado. Cerramos el tema.", at: "02/06 14:30" },
    ],
  },
];

/* ============================ TRÁMITES (requests) ============================
 * Un solo modelo con `type` + payload (§7). Tipos: inasistencia, autorización
 * de salida, comprobante de pago. Estados: enviado/aprobado/rechazado/resuelto.
 */
export type RequestType = "absence" | "exit" | "payment";
export type RequestStatus = "submitted" | "approved" | "rejected" | "resolved";

export interface RequestTypeMeta {
  type: RequestType;
  titleKey: string;
  descKey: string;
  icon: string;
  color: string;
}

export const REQUEST_TYPES: RequestTypeMeta[] = [
  { type: "absence", titleKey: "req.type.absence", descKey: "req.type.absence.desc", icon: "CalendarX", color: "requests" },
  { type: "exit", titleKey: "req.type.exit", descKey: "req.type.exit.desc", icon: "DoorOpen", color: "docs" },
  { type: "payment", titleKey: "req.type.payment", descKey: "req.type.payment.desc", icon: "CreditCard", color: "news" },
];

export interface RequestItem {
  id: string;
  type: RequestType;
  studentName: string;
  group: string;
  summary: string;
  createdAt: string;
  status: RequestStatus;
  handledBy?: string;
}

export const DEMO_REQUESTS: RequestItem[] = [
  { id: "r1", type: "absence", studentName: "Tomás Méndez", group: "6°B", summary: "Ausente por consulta médica", createdAt: "Hoy 08:10", status: "submitted" },
  { id: "r2", type: "exit", studentName: "Catalina Ruiz", group: "6°B", summary: "Retira la abuela a las 12:30", createdAt: "Ayer", status: "approved", handledBy: "Valentina Ríos" },
  { id: "r3", type: "payment", studentName: "Tomás Méndez", group: "6°B", summary: "Comprobante cuota junio", createdAt: "Ayer", status: "resolved", handledBy: "Administración" },
  { id: "r4", type: "absence", studentName: "Lucía Far", group: "6°B", summary: "Ausente por viaje familiar (3 días)", createdAt: "08/06", status: "rejected", handledBy: "Dirección" },
  { id: "r5", type: "exit", studentName: "Catalina Ruiz", group: "6°B", summary: "Se retira sola (autorizado por tutor)", createdAt: "05/06", status: "resolved", handledBy: "Valentina Ríos" },
];
