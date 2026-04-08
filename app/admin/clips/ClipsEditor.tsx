"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Clip = {
  id: number
  text: string
  youtubeId: string
  startSec: number
  endSec: number
  level: string
  orderNum: number
}

export default function ClipsEditor({ clips }: { clips: Clip[] }) {
  const [edits, setEdits] = useState<Record<number, { startSec: number; endSec: number }>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<Set<number>>(new Set())

  const LEVEL_COLOR = { A: "bg-green-700", B: "bg-yellow-700", C: "bg-blue-700" } as Record<string, string>

  function getVal(clip: Clip, field: "startSec" | "endSec") {
    return edits[clip.id]?.[field] ?? clip[field]
  }

  function setVal(clipId: number, field: "startSec" | "endSec", val: number) {
    setEdits((prev) => ({ ...prev, [clipId]: { ...prev[clipId], [field]: val } }))
  }

  async function save(clip: Clip) {
    if (!edits[clip.id]) return
    setSaving(clip.id)
    await fetch(`/api/clips/${clip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edits[clip.id]),
    })
    setSaving(null)
    setSaved((prev) => new Set(prev).add(clip.id))
    setTimeout(() => setSaved((prev) => { const s = new Set(prev); s.delete(clip.id); return s }), 2000)
  }

  return (
    <div className="space-y-2">
      {clips.map((clip) => (
        <div key={clip.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
          <span className="text-zinc-500 text-xs w-5 font-mono">{clip.orderNum}</span>
          <Badge className={`${LEVEL_COLOR[clip.level]} text-xs w-6 justify-center`}>{clip.level}</Badge>
          <span className="flex-1 text-sm text-zinc-200 truncate">{clip.text}</span>

          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-zinc-500">起</label>
            <input
              type="number"
              value={getVal(clip, "startSec")}
              onChange={(e) => setVal(clip.id, "startSec", Number(e.target.value))}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500"
              step={0.5}
              min={0}
            />
            <label className="text-xs text-zinc-500">迄</label>
            <input
              type="number"
              value={getVal(clip, "endSec")}
              onChange={(e) => setVal(clip.id, "endSec", Number(e.target.value))}
              className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-yellow-500"
              step={0.5}
              min={0}
            />

            {/* 預覽連結 */}
            <a
              href={`https://www.youtube.com/watch?v=${clip.youtubeId}&t=${Math.floor(getVal(clip, "startSec"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
            >
              ▶
            </a>

            <Button
              size="sm"
              className="text-xs h-7 px-3"
              disabled={!edits[clip.id] || saving === clip.id}
              onClick={() => save(clip)}
            >
              {saving === clip.id ? "..." : saved.has(clip.id) ? "✓" : "儲存"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
