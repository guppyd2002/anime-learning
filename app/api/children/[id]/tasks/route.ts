import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dailyTasks, childProfiles } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const childId = parseInt(id)

  // 確認這個孩子屬於目前登入的父母
  const [child] = await db
    .select()
    .from(childProfiles)
    .where(and(eq(childProfiles.id, childId), eq(childProfiles.parentUserId, userId)))

  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.delete(dailyTasks).where(eq(dailyTasks.childProfileId, childId))

  return NextResponse.json({ ok: true })
}
