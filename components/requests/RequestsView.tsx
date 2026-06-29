"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "../icons";
import { SubmitButton } from "../SubmitButton";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import {
  REQUEST_TYPES,
  DEMO_REQUESTS,
  type RequestStatus,
  type RequestItem,
  type RequestType,
} from "@/lib/domain";
import type { MyChild, RequestComment } from "@/lib/requests";
import {
  createRequest,
  fetchRequestComments,
  addRequestComment,
  setRequestStatus,
  type RequestState,
} from "@/app/(app)/requests/actions";
import {
  ACCENT_ON,
  ACCENT_SOFT_BG,
  ACCENT_TEXT,
  type AccentColor,
} from "../colors";

const STATUS_META: Record<
  RequestStatus,
  { key: string; color: AccentColor; icon: string }
> = {
  submitted: { key: "req.status.submitted", color: "sky", icon: "Clock" },
  received: { key: "req.status.received", color: "brand", icon: "CircleCheck" },
  approved: { key: "req.status.approved", color: "brand", icon: "CircleCheck" },
  rejected: { key: "req.status.rejected", color: "requests", icon: "X" },
  resolved: { key: "req.status.resolved", color: "navy", icon: "CheckCheck" },
};

const FILTERS = [
  { id: "all", key: "req.filter.all" },
  { id: "pending", key: "req.filter.pending" },
  { id: "resolved", key: "req.filter.resolved" },
] as const;

export function RequestsView({
  items,
  canCreate = true,
  staff = false,
  children = [],
}: {
  items?: RequestItem[];
  canCreate?: boolean;
  staff?: boolean;
  children?: MyChild[];
}) {
  const { t, locale } = useLocale();
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [openType, setOpenType] = useState<RequestType | null>(null);
  const [detail, setDetail] = useState<RequestItem | null>(null);
  const data = items ?? DEMO_REQUESTS;

  // El colegio ve una solicitud de inasistencia como una NOTIFICACIÓN de la
  // familia; la familia la ve como algo que "informó". Mismo dato, otro encuadre.
  const rowTitle = (r: RequestItem) => {
    const typeMeta = REQUEST_TYPES.find((x) => x.type === r.type)!;
    if (staff && r.type === "absence") return t("req.staff.absenceTitle");
    if (staff && r.type === "exit") return t("req.staff.exitTitle");
    return t(typeMeta.titleKey);
  };

  const requests = data.filter((r) => {
    if (filter === "pending") return r.status === "submitted";
    if (filter === "resolved") return r.status !== "submitted";
    return true;
  });

  // Agrupamos por la FECHA del evento (inasistencia / salida), no por cuándo se
  // creó: una falta para el 3 de julio va a "Próximas" aunque se haya enviado hoy.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  function bucket(r: RequestItem): "today" | "upcoming" | "past" {
    if (!r.eventDate) return "past";
    const d = new Date(`${r.eventDate}T00:00:00`);
    if (d.getTime() === startOfToday.getTime()) return "today";
    return d > startOfToday ? "upcoming" : "past";
  }
  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" });

  const groups: { id: string; key: string; items: RequestItem[] }[] = [
    { id: "today", key: "req.group.today", items: requests.filter((r) => bucket(r) === "today") },
    { id: "upcoming", key: "req.group.upcoming", items: requests.filter((r) => bucket(r) === "upcoming") },
    { id: "past", key: "req.group.past", items: requests.filter((r) => bucket(r) === "past") },
  ].filter((g) => g.items.length > 0);

  function RequestRow({ r }: { r: RequestItem }) {
    const typeMeta = REQUEST_TYPES.find((x) => x.type === r.type)!;
    const status = STATUS_META[r.status];
    // El staff debe atender lo nuevo: resaltamos las que siguen "enviadas".
    const needsAttention = staff && r.status === "submitted";
    return (
      <li>
        <button
          type="button"
          onClick={() => setDetail(r)}
          className={`flex w-full items-center gap-3 rounded-[1.5rem] border bg-white p-4 text-left shadow-card transition-transform hover:-translate-y-0.5 ${
            needsAttention ? "border-cta/40" : "border-ink/5"
          }`}
        >
          <span
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${ACCENT_ON[typeMeta.color as AccentColor]}`}
          >
            <Icon name={typeMeta.icon} className="h-5 w-5" />
            {needsAttention ? (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-cta" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-700 text-ink">
              {rowTitle(r)} · {r.studentName}
            </p>
            <p className="truncate text-xs font-600 text-ink/55">{r.summary}</p>
            <p className="mt-0.5 text-[11px] font-700 text-ink/40">
              {r.group}
              {r.eventDate ? ` · ${fmtDate(r.eventDate)}` : ` · ${r.createdAt}`}
              {r.handledBy ? ` · ${t("req.handledBy")} ${r.handledBy}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-700 ${ACCENT_SOFT_BG[status.color]} ${ACCENT_TEXT[status.color]}`}
          >
            <Icon name={status.icon} className="h-3.5 w-3.5" />
            {t(status.key)}
          </span>
        </button>
      </li>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Crear nuevo trámite (no aplica para gestión/dirección) */}
      {canCreate ? (
      <section>
        <h2 className="mb-3 font-display text-base font-700 text-ink">
          {t("req.new")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {REQUEST_TYPES.filter((rt) => rt.type !== "payment").map((rt) => (
            <button
              key={rt.type}
              type="button"
              onClick={() => setOpenType(rt.type)}
              className="group flex items-center gap-3 rounded-[1.5rem] border border-ink/5 bg-white p-4 text-left shadow-card transition-transform hover:-translate-y-0.5"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${ACCENT_ON[rt.color as AccentColor]}`}
              >
                <Icon name={rt.icon} className="h-6 w-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-700 text-ink">
                  {t(rt.titleKey)}
                </span>
                <span className="block text-xs font-600 text-ink/50">
                  {t(rt.descKey)}
                </span>
              </span>
              <Icon
                name="ArrowRight"
                className="h-4 w-4 text-ink/30 transition-transform group-hover:translate-x-1 group-hover:text-brand"
              />
            </button>
          ))}
        </div>
      </section>
      ) : null}

      {/* Listado de trámites */}
      <section>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-700 transition-colors ${
                filter === f.id
                  ? "bg-ink text-white shadow-card"
                  : "bg-white text-ink/60 hover:text-ink"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="rounded-[1.5rem] border border-dashed border-ink/15 bg-white px-6 py-10 text-center text-sm font-500 text-ink/55">
            {t("req.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((g) => (
              <div key={g.id}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-700 uppercase tracking-wide text-ink/45">
                  {t(g.key)}
                  <span className="rounded-full bg-ink/5 px-1.5 py-0.5 text-[10px] text-ink/50">
                    {g.items.length}
                  </span>
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {g.items.map((r) => (
                    <RequestRow key={r.id} r={r} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {openType ? (
        <RequestForm type={openType} childrenList={children} onClose={() => setOpenType(null)} />
      ) : null}

      {detail ? (
        <RequestDetail
          request={detail}
          staff={staff}
          title={`${rowTitle(detail)} · ${detail.studentName}`}
          dateLabel={detail.eventDate ? fmtDate(detail.eventDate) : detail.createdAt}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </div>
  );
}

/** Detalle de una solicitud: datos + (staff) marcar recibido + hilo de comentarios. */
function RequestDetail({
  request,
  staff,
  title,
  dateLabel,
  onClose,
}: {
  request: RequestItem;
  staff: boolean;
  title: string;
  dateLabel: string;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [comments, setComments] = useState<RequestComment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [pending, start] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function reload() {
    const c = await fetchRequestComments(request.id);
    setComments(c);
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ block: "end" }));
  }
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    start(async () => {
      await addRequestComment(request.id, text);
      await reload();
    });
  }

  function acknowledge() {
    setStatus("received");
    start(async () => {
      await setRequestStatus(request.id, "received");
    });
  }

  const statusMeta = STATUS_META[status];
  const timeFmt = (iso: string) =>
    new Date(iso).toLocaleString(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-[1.75rem] border border-ink/10 bg-white shadow-pop sm:rounded-[1.75rem]">
        {/* Encabezado */}
        <div className="flex items-start gap-3 border-b border-ink/8 p-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-700 text-ink">{title}</h3>
            <p className="mt-0.5 text-xs font-700 text-ink/45">
              {request.group} · {dateLabel}
              {request.handledBy ? ` · ${t("req.handledBy")} ${request.handledBy}` : ""}
            </p>
            {request.summary ? (
              <p className="mt-2 rounded-2xl bg-mist px-3 py-2 text-sm font-600 text-ink/70">{request.summary}</p>
            ) : null}
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-700 ${ACCENT_SOFT_BG[statusMeta.color]} ${ACCENT_TEXT[statusMeta.color]}`}
          >
            <Icon name={statusMeta.icon} className="h-3.5 w-3.5" />
            {t(statusMeta.key)}
          </span>
        </div>

        {/* Acción del colegio: marcar como recibido */}
        {staff && status === "submitted" ? (
          <div className="border-b border-ink/8 px-5 py-3">
            <button
              type="button"
              onClick={acknowledge}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-700 text-white shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Icon name="CircleCheck" className="h-4 w-4" />
              {t("req.markReceived")}
            </button>
          </div>
        ) : null}

        {/* Hilo de comentarios */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <h4 className="mb-3 text-xs font-700 uppercase tracking-wide text-ink/45">{t("req.comments")}</h4>
          {comments === null ? (
            <p className="text-sm font-500 text-ink/40">…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm font-500 text-ink/45">{t("req.noComments")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {comments.map((c) => (
                <li key={c.id} className={`flex gap-2.5 ${c.mine ? "flex-row-reverse" : ""}`}>
                  <Avatar name={c.authorName} color={c.mine ? "brand" : "navy"} size="sm" />
                  <div className={`min-w-0 max-w-[80%] ${c.mine ? "items-end text-right" : ""} flex flex-col`}>
                    <span className="text-[11px] font-700 text-ink/45">
                      {c.authorName}
                      {c.authorRole === "guardian" ? ` · ${t("req.role.family")}` : ""}
                    </span>
                    <span
                      className={`mt-0.5 inline-block rounded-2xl px-3 py-2 text-sm font-600 ${
                        c.mine ? "bg-brand text-white" : "bg-mist text-ink/80"
                      }`}
                    >
                      {c.body}
                    </span>
                    <span className="mt-0.5 text-[10px] font-600 text-ink/35">{timeFmt(c.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Responder */}
        <div className="flex items-center gap-2 border-t border-ink/8 p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={staff ? t("req.replyToFamily") : t("req.commentPh")}
            className="min-w-0 flex-1 rounded-full bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            onClick={send}
            disabled={pending || !draft.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cta text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-50"
            aria-label={t("req.form.send")}
          >
            <Icon name="Send" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const REL_OPTIONS = ["Mamá", "Papá", "Abuelo/a", "Tío/a", "Tutor/a", "Otro"];

function RequestForm({
  type,
  childrenList,
  onClose,
}: {
  type: RequestType;
  childrenList: MyChild[];
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const [state, action] = useActionState<RequestState, FormData>(createRequest, null);
  const isExit = type === "exit";

  // Selección de fecha en orden día / mes / año (el <input type=date> nativo usa
  // el orden del SO del dispositivo, que a veces es mes/día; con selects lo
  // fijamos nosotros). El valor se envía como YYYY-MM-DD en un input oculto.
  const now = new Date();
  const [day, setDay] = useState(now.getDate());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based
  const [year, setYear] = useState(now.getFullYear());
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateValue = `${year}-${pad(month)}-${pad(day)}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = (m: number) =>
    new Date(2020, m - 1, 1).toLocaleDateString(locale, { month: "long" });
  const selectCls =
    "w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30";

  useEffect(() => {
    if (state?.ok) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />
      <form
        action={action}
        className="relative w-full max-w-md rounded-t-[1.75rem] border border-ink/10 bg-white p-5 shadow-pop sm:rounded-[1.75rem]"
      >
        <input type="hidden" name="type" value={type} />
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-requests/10 text-requests">
            <Icon name={isExit ? "DoorOpen" : "CalendarX"} className="h-5 w-5" />
          </span>
          <h3 className="font-display text-lg font-700 text-ink">
            {isExit ? t("req.form.exitTitle") : t("req.form.absenceTitle")}
          </h3>
        </div>

        <label className="mb-1 block text-xs font-700 text-ink/55">{t("req.form.child")}</label>
        <select
          name="studentId"
          required
          defaultValue={childrenList.length === 1 ? childrenList[0].studentId : ""}
          className="mb-3 w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="" disabled>
            {t("req.form.chooseChild")}
          </option>
          {childrenList.map((c) => (
            <option key={c.studentId} value={c.studentId}>
              {c.fullName}
              {c.groupName ? ` (${c.groupName})` : ""}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-xs font-700 text-ink/55">{t("req.form.date")}</label>
        <input type="hidden" name="date" value={dateValue} />
        <div className="mb-3 grid grid-cols-[1fr_1.5fr_1fr] gap-2">
          <select
            aria-label={t("req.form.day")}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className={selectCls}
          >
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            aria-label={t("req.form.month")}
            value={month}
            onChange={(e) => {
              const m = Number(e.target.value);
              setMonth(m);
              const dim = new Date(year, m, 0).getDate();
              if (day > dim) setDay(dim);
            }}
            className={`${selectCls} capitalize`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m} className="capitalize">
                {monthName(m)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("req.form.year")}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={selectCls}
          >
            {[now.getFullYear(), now.getFullYear() + 1].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {isExit ? (
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-700 text-ink/55">{t("req.form.who")}</label>
              <input
                name="pickupName"
                required
                placeholder={t("req.form.whoPh")}
                className="w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-700 text-ink/55">{t("req.form.relation")}</label>
              <select
                name="relationship"
                defaultValue=""
                className="w-full rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">—</option>
                {REL_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <label className="mb-1 block text-xs font-700 text-ink/55">
          {t("req.form.reason")}
        </label>
        <textarea
          name="reason"
          rows={2}
          placeholder={isExit ? t("req.form.reasonPhExit") : t("req.form.reasonPhAbsence")}
          className="mb-4 w-full resize-none rounded-xl bg-mist px-3 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
        />

        {state?.error ? (
          <p role="alert" className="mb-3 text-xs font-700 text-rose">
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-sm font-700 text-ink/55 transition-colors hover:bg-mist hover:text-ink"
          >
            {t("req.form.cancel")}
          </button>
          <SubmitButton
            pendingLabel={t("req.form.sending")}
            className="inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep"
          >
            <Icon name="Send" className="h-4 w-4" />
            {t("req.form.send")}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
