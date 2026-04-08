import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { childProfiles, clips, recordings } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ClipLearner from "./ClipLearner"

export default async function ClipPage({
  params,
}: {
  params: Promise<{ childId: string; clipId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const { childId, clipId } = await params

  const child = await db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.id, Number(childId)))
    .limit(1)

  if (!child[0] || child[0].parentUserId !== userId) redirect("/dashboard")

  const clip = await db
    .select()
    .from(clips)
    .where(eq(clips.id, Number(clipId)))
    .limit(1)

  if (!clip[0]) redirect(`/learn/${childId}`)

  const pastRecordings = await db
    .select()
    .from(recordings)
    .where(and(eq(recordings.childProfileId, Number(childId)), eq(recordings.clipId, Number(clipId))))
    .orderBy(desc(recordings.createdAt))
    .limit(5)

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/learn/${childId}`}>
          <Button variant="ghost" size="sm">← 返回</Button>
        </Link>
        <Badge variant="outline">Clip {clip[0].orderNum}</Badge>
        <Badge className={clip[0].level === "A" ? "bg-green-700" : clip[0].level === "B" ? "bg-yellow-700" : "bg-blue-700"}>
          Level {clip[0].level}
        </Badge>
      </div>

      {/* 目標句子 */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
        <p className="text-xs text-zinc-500 mb-3">目標句子</p>
        <p className="text-2xl font-bold text-yellow-400">{clip[0].text}</p>
      </div>

      {/* 主要學習元件（Client Component） */}
      <ClipLearner
        clip={clip[0]}
        childId={Number(childId)}
        pastRecordings={pastRecordings}
      />
    </div>
  )
}
