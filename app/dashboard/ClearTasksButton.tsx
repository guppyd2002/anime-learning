"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ClearTasksButton({ childId, childName }: { childId: number; childName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClear() {
    if (!confirm(`確定要清除 ${childName} 的所有作業記錄嗎？`)) return
    setLoading(true)
    await fetch(`/api/children/${childId}/tasks`, { method: "DELETE" })
    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClear}
      disabled={loading}
      className="text-xs text-zinc-400 border-zinc-700 hover:border-red-700 hover:text-red-400"
    >
      {loading ? "清除中…" : "🗑 清除作業"}
    </Button>
  )
}
