"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useAuth } from "@/lib/store"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function NotesPage() {
  const { apiBase, token } = useAuth()
  const { toast } = useToast()
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await apiFetch("/notes", {}, apiBase, token)
      setNotes(res)
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Notes</h1>
        <Button onClick={load} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      {loading ? <div>Loading...</div> : <DataTable rows={notes} dense />}
    </div>
  )
}
