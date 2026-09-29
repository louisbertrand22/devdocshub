import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page/page-header";

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
      <PageHeader title={title} description={description} actions={actions} />
      <div>{children}</div>
    </div>
  );
}
