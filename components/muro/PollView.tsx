"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "../icons";
import { getPollData, votePoll, type PollOption } from "@/app/(app)/muro/actions";

export function PollView({ postId }: { postId: string }) {
  const [opts, setOpts] = useState<PollOption[] | null>(null);
  const [, start] = useTransition();

  function load() {
    start(async () => setOpts(await getPollData(postId)));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (opts === null) {
    return <p className="mt-3 text-xs font-600 text-ink/40">Cargando encuesta…</p>;
  }
  const total = opts.reduce((s, o) => s + o.votes, 0);
  const voted = opts.some((o) => o.mine);

  return (
    <div className="mt-3 flex flex-col gap-2">
      {opts.map((o) => {
        const pct = total ? Math.round((o.votes * 100) / total) : 0;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => start(async () => { await votePoll(postId, o.id); load(); })}
            className={`relative overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm font-700 transition-colors ${
              o.mine ? "border-brand/50 text-ink" : "border-ink/10 text-ink/75 hover:border-brand/40"
            }`}
          >
            {voted ? (
              <span
                className={`absolute inset-y-0 left-0 ${o.mine ? "bg-brand/15" : "bg-ink/5"}`}
                style={{ width: `${pct}%` }}
                aria-hidden
              />
            ) : null}
            <span className="relative flex items-center gap-2">
              {o.mine ? <Icon name="CircleCheck" className="h-4 w-4 text-brand" /> : null}
              <span className="flex-1">{o.label}</span>
              {voted ? (
                <span className="text-xs font-700 text-ink/50">
                  {pct}% · {o.votes}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
      <p className="text-xs font-600 text-ink/40">
        {total} {total === 1 ? "voto" : "votos"}
        {voted ? " · tocá otra opción para cambiar" : " · tocá para votar"}
      </p>
    </div>
  );
}
