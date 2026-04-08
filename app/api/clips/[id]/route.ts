import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { clips } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { startSec, endSec } = await req.json()

  await db
    .update(clips)
    .set({ startSec, endSec })
    .where(eq(clips.id, Number(id)))

  return NextResponse.json({ ok: true })
}
