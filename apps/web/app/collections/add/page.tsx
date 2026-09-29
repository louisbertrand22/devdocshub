"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import CollectionForm from "@/components/forms/collection-form";
import { PageHeader } from "@/components/page/page-header";

export default function AddCollectionPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="collections / nouvelle" title="Nouvelle collection" description="Crée la collection ; tu y ajouteras tes docs juste après." />
      <CollectionForm onCreated={(c) => router.push(`/collections/${c.id}` as Route)} />
    </div>
  );
}
