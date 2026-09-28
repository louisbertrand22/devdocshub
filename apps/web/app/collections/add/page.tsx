"use client"

import { useRouter } from "next/navigation"
import CollectionForm from "@/components/forms/collection-form"

export default function AddCollectionPage() {
  const router = useRouter()

  const handleCreated = () => {
    // Navigate back to collections list after successful creation
    router.push("/collections")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Collection</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new collection to organize your documents
        </p>
      </div>
      
      <div className="max-w-2xl">
        <CollectionForm onCreated={handleCreated} />
      </div>
    </div>
  )
}
