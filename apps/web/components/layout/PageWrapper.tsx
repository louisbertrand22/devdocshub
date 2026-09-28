import { cn } from "@/lib/utils";

interface PageWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageWrapper({ title, description, children, actions, className }: PageWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h1>{title}</h1>
          {description && <p className="text-fg-muted">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div>{children}</div>
    </div>
  );
}
