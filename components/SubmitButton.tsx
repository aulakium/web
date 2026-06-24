"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "./icons";

/**
 * Botón de envío que se deshabilita solo mientras el formulario está enviando
 * (vía useFormStatus). Evita envíos duplicados por doble clic y muestra un
 * spinner. Debe usarse DENTRO de un <form action={...}>.
 */
export function SubmitButton({
  children,
  className = "",
  pendingLabel,
  spinnerOnly = false,
  disabled = false,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingLabel?: string;
  /** Para botones de solo ícono: muestra únicamente el spinner al enviar. */
  spinnerOnly?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      {...rest}
    >
      {pending ? (
        spinnerOnly ? (
          <Icon name="Loader2" className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Icon name="Loader2" className="h-4 w-4 animate-spin" />
            {pendingLabel ?? "Enviando…"}
          </>
        )
      ) : (
        children
      )}
    </button>
  );
}
