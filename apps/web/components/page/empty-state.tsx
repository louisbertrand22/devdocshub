import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <div className="grid size-10 place-items-center rounded-full bg-surface-2 text-fg-muted [&_svg]:size-5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
