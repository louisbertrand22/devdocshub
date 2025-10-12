"use client"

import { useRouter } from "next/navigation"
import { PageWrapper } from "@/components/layout/PageWrapper"
import DocForm from "@/components/forms/doc-form"

export default function NewDocPage() {
  const router = useRouter()

  const handleCreated = () => {
    // Navigate to docs list after successful creation
    router.push("/docs")
  }

  return (
    <PageWrapper
      title="Create New Document"
      description="Add a new documentation entry to your collection"
    >
      <div className="max-w-2xl">
        <DocForm onCreated={handleCreated} />
      </div>
    </PageWrapper>
  )
}
