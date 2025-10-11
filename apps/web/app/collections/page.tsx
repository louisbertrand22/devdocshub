"use client"

import { useEffect, useState } from "react"
import { DataTable } from "../../components/data-table"
import { Button } from "../../components/ui/button"
import { apiFetch } from "../../lib/api"
import { useAuth } from "../../lib/store"

export default function CollectionsPage() {
  const { apiBase, token } = useAuth()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) { setError("Non authentifié. Connecte-toi dans /auth."); return; }
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch("/collections/", {}, apiBase, token)
      setRows(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token]) // recharge dès qu'on a un token

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Collections</h1>
        <Button onClick={load} variant="outline">{loading ? "Loading..." : "Refresh"}</Button>
      </div>

      {!token && <div style={{ color: "#b91c1c" }}>Non authentifié. Va sur <a href="/auth">/auth</a> pour te connecter.</div>}
      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
      <DataTable rows={rows} />
    </div>
  )
}
