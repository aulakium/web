// Preferencias de notificación: categorías, defaults y resolución.
// Hoy solo el canal "push" (email queda para una etapa futura).

export type NotifCategory = "tarea" | "mensaje" | "comunicado" | "invitacion";

/** Orden de aparición en el perfil. */
export const NOTIF_CATEGORIES: NotifCategory[] = [
  "tarea",
  "mensaje",
  "comunicado",
  "invitacion",
];

/**
 * Default: solo Tareas y Mensajes privados mandan push. El resto, apagado.
 * (Se eligió así para no saturar; el usuario lo cambia en su perfil.)
 */
export const DEFAULT_PUSH: Record<NotifCategory, boolean> = {
  tarea: true,
  mensaje: true,
  comunicado: false,
  invitacion: false,
};

export interface NotifPrefs {
  push?: Partial<Record<NotifCategory, boolean>>;
}

/** ¿El usuario quiere push para esta categoría? Cae al default si no lo definió. */
export function isPushEnabled(prefs: unknown, cat: NotifCategory): boolean {
  const v = (prefs as NotifPrefs | null | undefined)?.push?.[cat];
  return typeof v === "boolean" ? v : DEFAULT_PUSH[cat];
}

/** Mapea el tipo de novedad (post) a su categoría de notificación. */
export function categoryForPostType(type: string | null | undefined): NotifCategory {
  if (type === "tarea" || type === "task") return "tarea";
  if (type === "invitacion" || type === "invitation" || type === "evento") return "invitacion";
  return "comunicado";
}
