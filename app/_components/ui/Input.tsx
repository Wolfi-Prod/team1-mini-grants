import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-fg)]"
        >
          {label}
          {rest.required ? <span className="ml-0.5 text-[var(--color-fg)]">*</span> : null}
        </label>
      ) : null}
      <div
        className={cn(
          "flex items-stretch border border-[var(--color-border-muted)]",
          "focus-within:border-[var(--color-fg)] focus-within:ring-1 focus-within:ring-[var(--color-fg)]",
          error && "border-[var(--color-fg)]",
        )}
      >
        {leading ? (
          <span className="flex items-center justify-center border-r border-[var(--color-border-muted)] px-2.5 text-sm text-[var(--color-fg-muted)]">
            {leading}
          </span>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "h-9 w-full bg-transparent px-3 text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-fg-subtle)]",
            "disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-fg-subtle)] disabled:cursor-not-allowed",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...rest}
        />
      </div>
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="text-[11px] text-[var(--color-fg-subtle)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-[11px] font-medium text-[var(--color-fg)]">
          {error}
        </p>
      ) : null}
    </div>
  );
});
