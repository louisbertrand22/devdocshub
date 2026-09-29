import { SectionLayout } from "@/components/layout/section-layout";
import { NotesSidebar } from "@/components/layout/notes-sidebar";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <SectionLayout sidebar={<NotesSidebar />}>{children}</SectionLayout>;
}
