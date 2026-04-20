export default function GlobalLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin border-2 border-[var(--color-border-muted)] border-t-transparent" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-fg-muted)]">
          Loading
        </p>
      </div>
    </div>
  );
}
