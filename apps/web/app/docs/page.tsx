"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "../../lib/api"
import { useAuth } from "../../lib/store"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function DocsPage() {
  const { apiBase, token } = useAuth()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFetch("/docs/all", {}, apiBase, token)
      setDocs(res)
    } catch (e: any) {
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">All Documents</h1>
        <Button onClick={load} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable rows={docs} dense />
      )}
    </div>
  )
}
