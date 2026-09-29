import { SectionLayout } from "@/components/layout/section-layout";
import { CollectionsSidebar } from "@/components/layout/collections-sidebar";

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<CollectionsSidebar />}>{children}</SectionLayout>;
}
