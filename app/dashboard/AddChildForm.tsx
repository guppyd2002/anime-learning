"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const AVATARS = ["🏴‍☠️", "⚔️", "🍖", "🗺️", "💀", "🌊", "⚓", "🔥"]

export default function AddChildForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [avatar, setAvatar] = useState("🏴‍☠️")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age: Number(age), avatar }),
    })
    setLoading(false)
    setOpen(false)
    setName("")
    setAge("")
    router.refresh()
  }

  if (!open) {
    return (
      <Card
        className="bg-zinc-900 border-zinc-700 border-dashed flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors min-h-[200px]"
        onClick={() => setOpen(true)}
      >
        <div className="text-center text-zinc-500">
          <div className="text-3xl mb-2">+</div>
          <p className="text-sm">新增孩子帳號</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-base">新增孩子帳號</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              placeholder="例如：小明"
              required
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">年齡</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              placeholder="9"
              min={1}
              max={18}
              required
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">頭像</label>
            <div className="flex gap-2 flex-wrap">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-1 rounded transition-all ${avatar === a ? "ring-2 ring-yellow-400" : ""}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
              {loading ? "建立中..." : "建立"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
