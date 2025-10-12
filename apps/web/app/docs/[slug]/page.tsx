"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/store"
import ReactMarkdown from "react-markdown"
import styles from "./doc-view.module.css"

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

  if (!doc) {
    return (
      <div className={styles.docViewContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Loading document...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.docViewContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>{doc.title}</h1>
          <div className={styles.slug}>{doc.slug}</div>
        </div>
        <div className={styles.content}>
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
