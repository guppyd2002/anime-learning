import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { childProfiles, points } from "@/lib/db/schema"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, age, avatar } = await req.json()

  const [child] = await db
    .insert(childProfiles)
    .values({ parentUserId: userId, name, age, avatar })
    .returning()

  await db.insert(points).values({ childProfileId: child.id, total: 0 })

  return NextResponse.json(child)
}
