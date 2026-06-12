"use client";

import { useState } from "react";
import { Icon } from "../icons";
import { Avatar } from "../Avatar";
import { useLocale } from "../locale-context";
import { DEMO_CONVERSATIONS, DEMO_USER, type Conversation } from "@/lib/domain";
import { ACCENT_SOFT_BG, ACCENT_TEXT, type AccentColor } from "../colors";

const FILTERS = [
  { id: "open", key: "conv.filter.open" },
  { id: "closed", key: "conv.filter.closed" },
] as const;

export function ConversationsView() {
  const { t } = useLocale();
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const [selectedId, setSelectedId] = useState<string>(DEMO_CONVERSATIONS[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);

  const list = DEMO_CONVERSATIONS.filter((c) => c.status === filter);
  const selected =
    DEMO_CONVERSATIONS.find((c) => c.id === selectedId) ?? list[0] ?? null;

  function openConversation(id: string) {
    setSelectedId(id);
    setMobileOpen(true);
  }

  return (
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
              className={`flex-1 rounded-full px-3 py-2 text-sm font-800 transition-colors ${
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
                conversation={c}
                active={c.id === selectedId}
                onClick={() => openConversation(c.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* HILO */}
      <div
        className={`${mobileOpen ? "flex" : "hidden lg:flex"} min-h-[70dvh] flex-col overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-card lg:min-h-0`}
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
  const other = c.participants.find((p) => p.role !== "teacher") ?? c.participants[0];
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
          <p className="min-w-0 flex-1 truncate text-sm font-800 text-ink">
            {c.subject}
          </p>
          <span className="shrink-0 text-[11px] font-700 text-ink/40">
            {c.lastAt}
          </span>
        </div>
        <p className="truncate text-xs font-600 text-ink/55">{c.preview}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-800 text-navy">
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
            <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-cta px-1.5 text-[11px] font-800 text-white">
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

  return (
    <>
      {/* Cabecera del hilo */}
      <div className="flex items-center gap-3 border-b border-ink/5 p-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("conv.back")}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink/60 transition-colors hover:bg-mist lg:hidden"
        >
          <Icon name="ChevronLeft" className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-800 text-ink">
            {c.subject}
          </h2>
          <p className="truncate text-xs font-600 text-ink/55">
            {c.participants.map((p) => p.name).join(", ")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-navy/10 px-2.5 py-1 text-[11px] font-800 text-navy">
          {c.scopeLabel}
        </span>
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
      <div className="border-t border-ink/5 p-3">
        <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-700 text-ink/40">
          <Icon name="Users" className="h-3.5 w-3.5" />
          {t("conv.scopeNote")}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={t("conv.reply")}
            className="min-w-0 flex-1 rounded-2xl bg-mist px-4 py-3 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cta text-white shadow-soft transition-colors hover:bg-cta-deep"
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
          <p className="mb-0.5 text-[11px] font-800 text-ink/45">
            {message.sender.name}
          </p>
          {message.body}
        </div>
        <p className="mt-1 pl-1 text-[11px] font-600 text-ink/40">{message.at}</p>
      </div>
    </div>
  );
}
