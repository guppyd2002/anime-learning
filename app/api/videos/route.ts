import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { videos } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(videos)
    .where(eq(videos.parentUserId, userId))

  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { youtubeId, title, description, minAge, maxAge } = await req.json()

  if (!youtubeId || !title) {
    return NextResponse.json({ error: "youtubeId and title are required" }, { status: 400 })
  }

  const [video] = await db
    .insert(videos)
    .values({ youtubeId, title, description, minAge: minAge ?? 7, maxAge: maxAge ?? 12, parentUserId: userId })
    .returning()

  return NextResponse.json(video)
}
