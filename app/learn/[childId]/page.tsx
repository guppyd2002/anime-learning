import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { childProfiles, clips, dailyTasks, points } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const LEVEL_COLOR = { A: "bg-green-700", B: "bg-yellow-700", C: "bg-blue-700" }
const LEVEL_LABEL = { A: "基礎", B: "進階", C: "挑戰" }

export default async function LearnPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const { childId } = await params
  const child = await db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.id, Number(childId)))
    .limit(1)

  if (!child[0] || child[0].parentUserId !== userId) redirect("/dashboard")

  const allClips = await db.select().from(clips).orderBy(clips.orderNum)

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = await db
    .select()
    .from(dailyTasks)
    .where(and(eq(dailyTasks.childProfileId, Number(childId)), eq(dailyTasks.date, today)))

  const completedClipIds = new Set(
    todayTasks.filter((t) => t.completed).map((t) => t.clipId)
  )

  const pts = await db
    .select()
    .from(points)
    .where(eq(points.childProfileId, Number(childId)))
    .limit(1)

  const totalPoints = pts[0]?.total ?? 0

  const grouped = {
    A: allClips.filter((c) => c.level === "A"),
    B: allClips.filter((c) => c.level === "B"),
    C: allClips.filter((c) => c.level === "C"),
  }

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← 返回</Button>
          </Link>
          <span className="text-2xl">{child[0].avatar}</span>
          <div>
            <h1 className="text-xl font-bold">{child[0].name} 的學習頁</h1>
            <p className="text-xs text-zinc-400">{child[0].age}歲</p>
          </div>
        </div>
        <div className="text-yellow-400 font-bold text-lg">⭐ {totalPoints}</div>
      </div>

      {/* 今日進度 */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">今日任務</p>
            <span className="text-xs text-zinc-400">
              {completedClipIds.size} / {todayTasks.length > 0 ? todayTasks.length : "—"}
            </span>
          </div>
          {todayTasks.length > 0 && (
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(completedClipIds.size / todayTasks.length) * 100}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clip 列表 */}
      {(["A", "B", "C"] as const).map((level) => (
        <div key={level}>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={LEVEL_COLOR[level]}>Level {level}</Badge>
            <span className="text-sm text-zinc-400">{LEVEL_LABEL[level]}</span>
          </div>
          <div className="grid gap-2">
            {grouped[level].map((clip) => {
              const done = completedClipIds.has(clip.id)
              return (
                <Link key={clip.id} href={`/learn/${childId}/clip/${clip.id}`}>
                  <Card className={`border transition-colors cursor-pointer hover:border-yellow-500/50 ${done ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-900 border-zinc-800"}`}>
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 text-xs font-mono w-6">{clip.orderNum}</span>
                        <span className={`text-sm font-medium ${done ? "text-zinc-500" : "text-zinc-100"}`}>
                          {clip.text}
                        </span>
                      </div>
                      {done && <span className="text-green-400 text-sm">✓</span>}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
