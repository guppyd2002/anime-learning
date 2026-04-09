"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Video = {
  id: number
  youtubeId: string
  title: string
  description: string | null
  minAge: number
  maxAge: number
}

export default function VideosTab() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ youtubeId: "", title: "", description: "", minAge: "7", maxAge: "12" })
  const [saving, setSaving] = useState(false)

  async function fetchVideos() {
    const res = await fetch("/api/videos")
    const data = await res.json()
    setVideos(data)
    setLoading(false)
  }

  useEffect(() => { fetchVideos() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.youtubeId.trim() || !form.title.trim()) return
    setSaving(true)
    await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        youtubeId: form.youtubeId.trim(),
        title: form.title.trim(),
        description: form.description.trim() || null,
        minAge: parseInt(form.minAge),
        maxAge: parseInt(form.maxAge),
      }),
    })
    setForm({ youtubeId: "", title: "", description: "", minAge: "7", maxAge: "12" })
    setSaving(false)
    fetchVideos()
  }

  return (
    <div className="space-y-6">
      {/* 新增影片表單 */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base">新增影片</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">YouTube ID</label>
                <input
                  placeholder="例：2Bh7WwjIex0"
                  value={form.youtubeId}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">標題</label>
                <input
                  placeholder="例：One Piece EP1"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">說明（選填）</label>
              <input
                placeholder="影片內容簡介"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">最小年齡</label>
                <input
                  type="number"
                  min={4}
                  max={18}
                  value={form.minAge}
                  onChange={(e) => setForm((f) => ({ ...f, minAge: e.target.value }))}
                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">最大年齡</label>
                <input
                  type="number"
                  min={4}
                  max={18}
                  value={form.maxAge}
                  onChange={(e) => setForm((f) => ({ ...f, maxAge: e.target.value }))}
                  className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="mt-5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              >
                {saving ? "新增中…" : "+ 新增"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 影片列表 */}
      {loading ? (
        <p className="text-zinc-500 text-sm">載入中…</p>
      ) : videos.length === 0 ? (
        <p className="text-zinc-600 text-sm">尚無影片，請新增第一部！</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {videos.map((v) => (
            <Card key={v.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{v.title}</p>
                    {v.description && <p className="text-xs text-zinc-400 mt-0.5">{v.description}</p>}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{v.minAge}–{v.maxAge}歲</Badge>
                </div>
                <p className="text-xs text-zinc-500 font-mono">ID: {v.youtubeId}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-yellow-500 hover:underline"
                >
                  ▶ 在 YouTube 開啟
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
