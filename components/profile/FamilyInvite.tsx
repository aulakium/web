"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { useLocale } from "@/components/locale-context";
import { inviteCoTutor, type CoTutorState } from "@/app/(app)/profile/actions";

export interface FamilyChild {
  studentId: string;
  studentName: string;
  groupName: string | null;
}

export function FamilyInvite({ kids }: { kids: FamilyChild[] }) {
  const { t } = useLocale();
  const [state, formAction, pending] = useActionState<CoTutorState, FormData>(
    inviteCoTutor,
    null,
  );
  // Por defecto, todos los hijos seleccionados.
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(kids.map((c) => c.studentId)),
  );

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="rounded-[1.5rem] border border-ink/8 bg-white p-5 shadow-card">
      <h2 className="mb-1 font-display text-base font-700 text-ink">{t("family.title")}</h2>
      <p className="mb-4 text-xs font-500 text-ink/50">{t("family.note")}</p>

      {kids.length === 0 ? (
        <p className="rounded-2xl bg-[#f1f5fa] px-4 py-3 text-sm font-600 text-ink/55">
          {t("family.empty")}
        </p>
      ) : (
        <>
          {/* Lista de hijos */}
          <div className="mb-5 flex flex-col gap-2">
            {kids.map((c) => (
              <div
                key={c.studentId}
                className="flex items-center gap-3 rounded-2xl bg-[#f1f5fa] px-4 py-3"
              >
                <Avatar name={c.studentName} color="news" size="sm" />
                <span className="flex-1 text-sm font-700 text-ink">{c.studentName}</span>
                {c.groupName ? (
                  <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-700 text-brand">
                    {c.groupName}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Formulario de invitación */}
          <form action={formAction} className="border-t border-ink/8 pt-4">
            <h3 className="mb-1 inline-flex items-center gap-1.5 text-sm font-700 text-ink">
              <Icon name="Users" className="h-4 w-4 text-brand" />
              {t("family.invite.title")}
            </h3>
            <p className="mb-3 text-xs font-500 text-ink/50">{t("family.invite.note")}</p>

            <div className="flex flex-col gap-2.5">
              <input
                name="email"
                type="email"
                required
                placeholder={t("family.invite.email")}
                className="rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
              />
              <div className="flex flex-wrap gap-2.5">
                <input
                  name="fullName"
                  placeholder={t("family.invite.name")}
                  className="min-w-0 flex-1 rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                />
                <input
                  name="relationship"
                  placeholder={t("family.invite.relationship")}
                  className="min-w-0 flex-1 rounded-xl bg-mist px-4 py-2.5 text-sm font-600 text-ink outline-none placeholder:text-ink/40 focus:ring-2 focus:ring-brand/30"
                />
              </div>

              {/* Selección de hijos */}
              <fieldset className="mt-1">
                <legend className="mb-1.5 text-xs font-700 text-ink/60">
                  {t("family.invite.pick")}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {kids.map((c) => {
                    const on = picked.has(c.studentId);
                    return (
                      <label
                        key={c.studentId}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-700 transition-colors ${
                          on
                            ? "border-brand bg-brand/10 text-brand"
                            : "border-ink/15 text-ink/50 hover:border-ink/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="studentIds"
                          value={c.studentId}
                          checked={on}
                          onChange={() => toggle(c.studentId)}
                          className="sr-only"
                        />
                        {on ? <Icon name="Check" className="h-3 w-3" /> : null}
                        {c.studentName}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={pending || picked.size === 0}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-sm font-700 text-white transition-colors hover:bg-navy-deep disabled:opacity-50"
              >
                <Icon name="Mail" className="h-4 w-4" />
                {pending ? t("family.invite.sending") : t("family.invite.send")}
              </button>

              {state?.ok ? (
                <div className="text-xs font-700 text-leaf">
                  {state.emailed ? t("family.invite.ok") : t("family.invite.okNoEmail")}
                  {!state.emailed && state.link ? (
                    <a
                      href={state.link}
                      className="ml-2 underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("family.invite.copyLink")}
                    </a>
                  ) : null}
                </div>
              ) : state?.error ? (
                <p className="text-xs font-700 text-rose">{state.error}</p>
              ) : null}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
