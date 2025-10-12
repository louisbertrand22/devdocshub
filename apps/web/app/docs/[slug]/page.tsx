"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/store"
import ReactMarkdown from "react-markdown"

export default function DocViewPage() {
  const params = useParams()
  const slug = params?.slug as string
  const { apiBase, token } = useAuth()
  const [doc, setDoc] = useState<any>(null)

  useEffect(() => {
    if (!slug) return
    apiFetch(`/docs/doc/${slug}`, {}, apiBase, token)
      .then(setDoc)
      .catch(console.error)
  }, [slug])

  if (!doc) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{doc.title}</h1>
      <div className="text-sm text-muted-foreground">{doc.slug}</div>
      <ReactMarkdown className="prose dark:prose-invert max-w-none">{doc.content}</ReactMarkdown>
    </div>
  )
}
