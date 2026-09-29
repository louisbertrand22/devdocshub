"use client";

import { useRouter } from "next/navigation";
import CollectionForm from "@/components/forms/collection-form";
import { PageHeader } from "@/components/page/page-header";

export default function AddCollectionPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader eyebrow="collections / nouvelle" title="Nouvelle collection" description="Crée une collection, puis ajoutes-y des docs." />
      <CollectionForm onCreated={() => router.push("/collections")} />
    </div>
  );
}
