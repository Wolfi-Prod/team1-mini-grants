import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className, id, rows = 4, ...rest }, ref) {
    const autoId = useId();
    const areaId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={areaId}
            className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-fg)]"
          >
            {label}
            {rest.required ? <span className="ml-0.5 text-[var(--color-fg)]">*</span> : null}
          </label>
        ) : null}
        <textarea
          id={areaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full border border-[var(--color-border-muted)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-subtle)]",
            "focus:border-[var(--color-fg)] focus:ring-1 focus:ring-[var(--color-fg)]",
            "disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-fg-subtle)] disabled:cursor-not-allowed",
            error && "border-[var(--color-fg)]",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {hint && !error ? (
          <p className="text-[11px] text-[var(--color-fg-subtle)]">{hint}</p>
        ) : null}
        {error ? (
          <p role="alert" className="text-[11px] font-medium text-[var(--color-fg)]">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
