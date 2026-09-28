import { SectionLayout } from "@/components/layout/section-layout";
import { DocsSidebar } from "@/components/layout/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<DocsSidebar />}>{children}</SectionLayout>;
}
