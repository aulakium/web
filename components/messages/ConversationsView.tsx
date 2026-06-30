"use client";

import { useState, useTransition, useActionState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { DEMO_CONVERSATIONS, DEMO_USER, type Conversation } from "@/lib/domain";
import { type AccentColor } from "../colors";
import {
  startConversation,
  sendMessage,
  archiveConversation,
  markConversationRead,
  type RecipientGroup,
  type Recipient,
  type StartState,
} from "@/app/(app)/messages/actions";

const FILTERS = [
  { id: "open", key: "conv.filter.open" },
  { id: "closed", key: "conv.filter.closed" },
] as const;

export function ConversationsView({
  conversations,
  recipients = [],
}: {
  conversations?: Conversation[];
  recipients?: RecipientGroup[];
}) {
  const { t } = useLocale();
  const data = conversations ?? DEMO_CONVERSATIONS;
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const [selectedId, setSelectedId] = useState<string>(data[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  // Conversaciones leídas en esta sesión: limpian el badge al instante mientras
  // el servidor confirma (mark_conversation_read + revalidación del layout).
  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());

  const list = data.filter((c) => c.status === filter);
  const selected =
    data.find((c) => c.id === selectedId && c.status === filter) ?? list[0] ?? null;

  function openConversation(id: string) {
    setSelectedId(id);
    setMobileOpen(true);
    const conv = data.find((c) => c.id === id);
    if (conv && conv.unread > 0 && !locallyRead.has(id)) {
      setLocallyRead((prev) => new Set(prev).add(id));
      void markConversationRead(id);
    }
  }

  return (
    <>
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-700 text-ink">{t("conv.title")}</h1>
        <p className="text-sm font-500 text-ink/55">{t("conv.subtitle")}</p>
      </div>
      {recipients.length > 0 ? (
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-cta px-4 py-2.5 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep"
        >
          <Icon name="Plus" className="h-4 w-4" />
          {t("conv.compose")}
        </button>
      ) : null}
    </div>
    {data.length === 0 ? (
      <div className="rounded-[1.75rem] border border-dashed border-ink/15 bg-white px-6 py-16 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-mist text-ink/40">
          <Icon name="MessagesSquare" className="h-6 w-6" />
        </span>
        <p className="font-display text-base font-700 text-ink">{t("conv.empty.title")}</p>
        <p className="mt-1 text-sm font-500 text-ink/55">
          {t("conv.empty.body")}
        </p>
      </div>
    ) : (
    <div className="grid gap-4 lg:h-[calc(100dvh-7.5rem)] lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* LISTA */}
      <div
        className={`${mobileOpen ? "hidden lg:flex" : "flex"} min-h-0 flex-col overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card`}
      >
        <div className="flex items-center gap-2 border-b border-ink/5 p-3">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`flex-1 rounded-full px-3 py-2 text-sm font-700 transition-colors ${
                filter === f.id
                  ? "bg-ink text-white"
                  : "text-ink/55 hover:bg-mist"
              }`}
            >
              {t(f.key)}
            </button>
          ))}
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {list.map((c) => (
            <li key={c.id}>
              <ConversationRow
                conversation={locallyRead.has(c.id) ? { ...c, unread: 0 } : c}
                active={c.id === selectedId}
                onClick={() => openConversation(c.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* HILO — en móvil es una capa a pantalla completa (así el composer queda
          siempre pegado abajo, sin pelear con la barra de navegación). */}
      <div
        className={`${
          mobileOpen
            ? "fixed inset-0 z-40 flex rounded-none border-0"
            : "hidden"
        } min-h-0 flex-col overflow-hidden bg-white lg:relative lg:z-auto lg:flex lg:rounded-[1.75rem] lg:border lg:border-ink/5 lg:shadow-card`}
      >
        {selected ? (
          <Thread
            conversation={selected}
            onBack={() => setMobileOpen(false)}
          />
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center text-ink/40">
            <div className="flex flex-col items-center gap-2">
              <Icon name="MessagesSquare" className="h-10 w-10" />
              <p className="text-sm font-700">{t("conv.empty")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
    )}

    {composeOpen ? (
      <ComposeModal
        recipients={recipients}
        onClose={() => setComposeOpen(false)}
        onCreated={(id) => {
          setComposeOpen(false);
          setFilter("open");
          openConversation(id);
        }}
      />
    ) : null}
    </>
  );
}

function ConversationRow({
  conversation: c,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  // Mostrar a la OTRA persona (la que no soy yo), no mi propio avatar.
  const other =
    c.participants.find((p) => p.isMe === false) ??
    c.participants.find((p) => !p.isMe) ??
    c.participants[0];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors ${
        active ? "bg-brand-wash" : "hover:bg-mist"
      }`}
    >
      <Avatar name={other.name} color={other.color as AccentColor} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-700 text-ink">
            {c.subject}
          </p>
          <span className="shrink-0 text-[11px] font-700 text-ink/40">
            {c.lastAt}
          </span>
        </div>
        <p className="truncate text-xs font-600 text-ink/55">{c.preview}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-700 text-navy">
            {c.scopeLabel}
          </span>
          {c.labels.slice(0, 1).map((l) => (
            <span
              key={l}
              className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-700 text-ink/50"
            >
              {l}
            </span>
          ))}
          {c.unread > 0 ? (
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-cta px-1.5 text-[11px] font-700 text-white">
              {c.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function Thread({
  conversation: c,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function send() {
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    startTransition(async () => {
      await sendMessage(c.id, text);
      router.refresh();
    });
  }

  const archived = c.status === "closed";
  function toggleArchive() {
    startTransition(async () => {
      await archiveConversation(c.id, !archived);
      router.refresh();
    });
  }

  return (
    <>
      {/* Cabecera del hilo (en móvil el hilo es fixed inset-0: respetar el notch) */}
      <div className="flex items-center gap-3 border-b border-ink/5 px-4 pb-4 pt-[max(env(safe-area-inset-top),1rem)] lg:pt-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("conv.back")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-mist lg:hidden"
        >
          <Icon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-700 text-ink">
            {c.subject}
          </h2>
          <p className="truncate text-xs font-600 text-ink/55">
            {c.participants.map((p) => p.name).join(", ")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-navy/10 px-2.5 py-1 text-[11px] font-700 text-navy">
          {c.scopeLabel}
        </span>
        <button
          type="button"
          onClick={toggleArchive}
          disabled={pending}
          title={archived ? t("conv.unarchive") : t("conv.archive")}
          aria-label={archived ? t("conv.unarchiveConv") : t("conv.archiveConv")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/50 transition-colors hover:bg-mist hover:text-ink disabled:opacity-50"
        >
          <Icon name={archived ? "ArchiveRestore" : "Archive"} className="h-5 w-5" />
        </button>
      </div>

      {/* Mensajes */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-mist/50 p-4">
        {c.messages.map((m) => (
          <MessageBubble
            key={m.id}
            mine={m.mine ?? m.sender.name === DEMO_USER.name}
            message={m}
          />
        ))}
      </div>

      {/* Composer + nota de privacidad (regla de scope §3.3) */}
      <div className="border-t border-ink/5 px-3 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] lg:pb-3">
        <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-700 text-ink/40">
          <Icon name="Users" className="h-3.5 w-3.5" />
          {t("conv.scopeNote")}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t("conv.reply")}
            className="min-w-0 flex-1 rounded-2xl bg-mist px-4 py-3 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            onClick={send}
            disabled={pending || !draft.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cta text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-40"
            aria-label={t("conv.send")}
          >
            <Icon name="Send" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}

function MessageBubble({
  mine,
  message,
}: {
  mine: boolean;
  message: { sender: { name: string; color: string }; body: string; at: string };
}) {
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="rounded-3xl rounded-tr-md bg-brand px-4 py-2.5 text-sm font-600 text-white shadow-sm">
            {message.body}
          </div>
          <p className="mt-1 pr-1 text-right text-[11px] font-600 text-ink/40">
            {message.at}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <Avatar
        name={message.sender.name}
        color={message.sender.color as AccentColor}
        size="sm"
      />
      <div className="max-w-[78%]">
        <div className="rounded-3xl rounded-tl-md bg-white px-4 py-2.5 text-sm font-600 text-ink shadow-sm ring-1 ring-ink/5">
          <p className="mb-0.5 text-[11px] font-700 text-ink/45">
            {message.sender.name}
          </p>
          {message.body}
        </div>
        <p className="mt-1 pl-1 text-[11px] font-600 text-ink/40">{message.at}</p>
      </div>
    </div>
  );
}

/** Modal "Escribir": elegir destinatario por categoría → asunto + mensaje. */
function ComposeModal({
  recipients,
  onClose,
  onCreated,
}: {
  recipients: RecipientGroup[];
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Recipient | null>(null);
  const [state, formAction, pending] = useActionState<StartState, FormData>(
    startConversation,
    null,
  );

  useEffect(() => {
    if (state?.conversationId) {
      router.refresh();
      onCreated(state.conversationId);
    }
  }, [state, router, onCreated]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipients;
    return recipients
      .map((g) => ({
        title: g.title,
        people: g.people.filter(
          (p) =>
            p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.people.length > 0);
  }, [recipients, query]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 sm:place-items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-card sm:max-w-md sm:rounded-[1.75rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center gap-3 border-b border-ink/5 p-4">
          {picked ? (
            <button
              type="button"
              onClick={() => setPicked(null)}
              aria-label={t("conv.back")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-mist"
            >
              <Icon name="ChevronLeft" className="h-5 w-5" />
            </button>
          ) : null}
          <h2 className="flex-1 font-display text-lg font-700 text-ink">
            {picked ? t("conv.newTitle") : t("conv.toWhom")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("conv.close")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-mist"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        </div>

        {picked ? (
          /* Paso 2 — asunto + mensaje */
          <form action={formAction} className="flex min-h-0 flex-1 flex-col">
            <input type="hidden" name="targetId" value={picked.id} />
            <div className="border-b border-ink/5 p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-mist px-3 py-2.5">
                <Avatar name={picked.name} color={picked.color as AccentColor} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-700 text-ink">{picked.name}</p>
                  <p className="truncate text-xs font-600 text-ink/50">{picked.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
              <input
                name="subject"
                placeholder={t("conv.subjectPh")}
                className="rounded-2xl bg-mist px-4 py-3 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
              <textarea
                name="body"
                rows={5}
                placeholder={t("conv.messagePh")}
                className="min-h-[7rem] flex-1 resize-none rounded-2xl bg-mist px-4 py-3 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
              {state?.error ? (
                <p className="text-xs font-700 text-rose">{state.error}</p>
              ) : null}
            </div>
            <div className="border-t border-ink/5 p-3">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-2xl bg-cta px-4 py-3 text-sm font-700 text-white shadow-soft transition-colors hover:bg-cta-deep disabled:opacity-50"
              >
                {pending ? t("conv.sending") : t("conv.sendMessage")}
              </button>
            </div>
          </form>
        ) : (
          /* Paso 1 — selector por categoría */
          <>
            <div className="border-b border-ink/5 p-3">
              <div className="flex items-center gap-2 rounded-2xl bg-mist px-3">
                <Icon name="Search" className="h-4 w-4 text-ink/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("conv.searchPerson")}
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm font-600 text-ink/45">
                  {t("conv.noPerson")}
                </p>
              ) : (
                filtered.map((g) => (
                  <div key={g.title} className="mb-2">
                    <p className="px-3 py-1.5 text-[11px] font-700 uppercase tracking-wide text-ink/40">
                      {g.title}
                    </p>
                    {g.people.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPicked(p)}
                        className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-mist"
                      >
                        <Avatar name={p.name} color={p.color as AccentColor} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-700 text-ink">{p.name}</p>
                          <p className="truncate text-xs font-600 text-ink/50">{p.subtitle}</p>
                        </div>
                        <Icon name="ChevronRight" className="h-4 w-4 shrink-0 text-ink/30" />
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
