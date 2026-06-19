"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Icon } from "../icons";
import {
  getNotifications,
  markAllRead,
  type NotificationItem,
} from "@/lib/notifications";

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [, start] = useTransition();

  function refresh() {
    start(async () => {
      const res = await getNotifications();
      setItems(res.items);
      setUnread(res.unread);
      setLoaded(true);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) refresh();
        }}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:border-brand/40"
      >
        <Icon name="Bell" className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full border-2 border-white bg-cta px-1 text-[10px] font-700 text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-ink/8 px-4 py-2.5">
              <span className="text-sm font-700 text-ink">Notificaciones</span>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={() => start(async () => { await markAllRead(); refresh(); })}
                  className="text-xs font-700 text-brand hover:text-ink"
                >
                  Marcar todo leído
                </button>
              ) : null}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!loaded ? (
                <p className="px-4 py-6 text-center text-sm font-600 text-ink/40">Cargando…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm font-600 text-ink/40">
                  Estás al día 🎉
                </p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-mist"
                  >
                    <span
                      className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                        n.kind === "post" ? "bg-news/15 text-news" : "bg-brand/10 text-brand"
                      }`}
                    >
                      <Icon name={n.kind === "post" ? "Megaphone" : "CalendarDays"} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-700 text-ink">{n.title}</span>
                      <span className="block truncate text-xs font-500 text-ink/50">{n.subtitle}</span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
