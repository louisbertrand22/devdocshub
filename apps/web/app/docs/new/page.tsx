"use client";

import { useRouter } from "next/navigation";
import DocForm from "@/components/forms/doc-form";
import { PageHeader } from "@/components/page/page-header";

export default function NewDocPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="docs / nouveau" title="Nouveau doc" description="Rédige en markdown ; il apparaîtra dans ~/techno." />
      <DocForm onCreated={() => router.push("/docs")} onCancel={() => router.push("/docs")} />
    </div>
  );
}
