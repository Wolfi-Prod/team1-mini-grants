import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, placeholder, className, id, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-fg)]"
        >
          {label}
          {rest.required ? <span className="ml-0.5 text-[var(--color-fg)]">*</span> : null}
        </label>
      ) : null}
      <div
        className={cn(
          "relative flex items-stretch border border-[var(--color-border-muted)]",
          "focus-within:border-[var(--color-fg)] focus-within:ring-1 focus-within:ring-[var(--color-fg)]",
          error && "border-[var(--color-fg)]",
        )}
      >
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={cn(
            "h-9 w-full appearance-none bg-transparent px-3 pr-9 text-sm text-[var(--color-fg)] outline-none",
            "disabled:bg-[var(--color-bg-subtle)] disabled:text-[var(--color-fg-subtle)] disabled:cursor-not-allowed",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled={rest.required}>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[var(--color-fg-subtle)]"
        >
          <ChevronDown size={14} />
        </span>
      </div>
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
});
