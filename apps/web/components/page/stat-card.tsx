export function StatCard({ label, value, loading }: { label: string; value?: number; loading?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3">
      <span className="font-mono text-[11px] text-fg-muted">{label}</span>
      {loading ? (
        <span className="h-7 w-10 animate-pulse rounded bg-surface-2" aria-hidden />
      ) : (
        <span className="font-mono text-2xl font-semibold text-fg">{value ?? "—"}</span>
      )}
    </div>
  );
}
