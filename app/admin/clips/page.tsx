import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { clips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import ClipsEditor from "./ClipsEditor"

export default async function AdminClipsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const allClips = await db.select().from(clips).orderBy(clips.orderNum)

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ 管理 Clip 時間戳</h1>
        <p className="text-zinc-400 text-sm mt-1">
          設定每個句子在 YouTube 影片中的起訖秒數（Video ID: <code className="text-yellow-400">2Bh7WwjIex0</code>）
        </p>
      </div>
      <ClipsEditor clips={allClips} />
    </div>
  )
}
