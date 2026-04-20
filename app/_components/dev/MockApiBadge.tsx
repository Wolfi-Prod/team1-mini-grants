import { cn } from "@/lib/utils";

interface MockApiBadgeProps {
  endpoints: string[];
  className?: string;
}

export function MockApiBadge({ endpoints, className }: MockApiBadgeProps) {
  if (endpoints.length === 0) return null;
  return (
    <details
      className={cn(
        "border border-dashed px-3 py-2 text-[9px] uppercase tracking-[0.14em]",
        className,
      )}
      style={{
        borderColor: "var(--subtle-border)",
        color: "var(--text-dim)",
        fontFamily: "var(--font-pixel)",
      }}
    >
      <summary className="cursor-pointer font-bold" style={{ color: "var(--text-muted)" }}>
        MOCK DATA — {endpoints.length} API endpoint{endpoints.length === 1 ? "" : "s"}
      </summary>
      <ul
        className="mt-2 flex flex-col gap-1 normal-case tracking-normal"
        style={{ fontSize: "11px", fontFamily: "var(--font-mono-display)", color: "var(--text-dim)" }}
      >
        {endpoints.map((e) => (
          <li key={e}>→ {e}</li>
        ))}
      </ul>
    </details>
  );
}
