"use client"

import AuthPanel from "@/components/auth-panel"

export default function AuthPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Authentication</h1>
      <AuthPanel />
    </div>
  )
}
