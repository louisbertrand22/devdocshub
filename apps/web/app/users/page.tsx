"use client"

import { useEffect, useState } from "react"
import { DataTable } from "../../components/data-table"
import { Button } from "../../components/ui/button"
import { apiFetch } from "../../lib/api"
import { useAuth } from "../../lib/store"
import { RefreshCw } from "lucide-react"

export default function UsersPage() {
  const { apiBase, token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) { setError("Non authentifié. Connecte-toi dans /auth."); return; }
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch("/users/", {}, apiBase, token)
      setRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Utilisateurs</h1>
        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
          {loading ? "Chargement..." : "Actualiser"}
        </Button>
      </div>

      {!token && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          Non authentifié. Va sur <a href="/auth" className="underline font-medium">/auth</a> pour te connecter.
        </div>
      )}
      
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      {loading && !rows.length ? (
        <div className="text-center py-8 text-muted-foreground">Chargement des utilisateurs...</div>
      ) : (
        <DataTable rows={rows} title="Liste des utilisateurs" />
      )}
    </div>
  )
}
