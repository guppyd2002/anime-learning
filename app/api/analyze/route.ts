import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { db } from "@/lib/db"
import { recordings, points, dailyTasks } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function calcAccuracy(transcript: string, target: string): number {
  const t = transcript.toLowerCase().replace(/[^a-z\s]/g, "").trim()
  const g = target.toLowerCase().replace(/[^a-z\s]/g, "").trim()
  const tWords = t.split(/\s+/)
  const gWords = g.split(/\s+/)
  const matched = gWords.filter((w) => tWords.includes(w)).length
  return Math.round((matched / gWords.length) * 100)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await req.formData()
  const audio = form.get("audio") as File
  const clipId = Number(form.get("clipId"))
  const childId = Number(form.get("childId"))
  const targetText = String(form.get("targetText"))

  // 1. 上傳到 Vercel Blob
  const { url: blobUrl } = await put(`recordings/${childId}/${clipId}/${Date.now()}.webm`, audio, {
    access: "public",
  })

  // 2. Whisper 轉文字
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
    language: "en",
  })
  const transcript = transcription.text.trim()

  // 3. 計算準確度
  const accuracyScore = calcAccuracy(transcript, targetText)

  // 4. Claude 批改建議
  const chatRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "你是一位友善的英語老師，學生是9-11歲的孩子。請用繁體中文給出簡短鼓勵的批改意見（50字以內）。",
      },
      {
        role: "user",
        content: `目標句子：「${targetText}」\n學生說了：「${transcript}」\n準確度：${accuracyScore}分\n請給建議。`,
      },
    ],
    max_tokens: 150,
  })
  const feedback = chatRes.choices[0].message.content ?? ""

  // 5. 存入 DB
  await db.insert(recordings).values({
    childProfileId: childId,
    clipId,
    blobUrl,
    transcript,
    accuracyScore,
    feedback,
  })

  // 6. 給點數（>= 80 分 +10 點，>= 60 分 +5 點）
  if (accuracyScore >= 60) {
    const addPts = accuracyScore >= 80 ? 10 : 5
    const existing = await db
      .select()
      .from(points)
      .where(eq(points.childProfileId, childId))
      .limit(1)

    if (existing[0]) {
      await db
        .update(points)
        .set({ total: existing[0].total + addPts, updatedAt: new Date() })
        .where(eq(points.childProfileId, childId))
    }
  }

  // 7. 標記每日任務完成
  const today = new Date().toISOString().split("T")[0]
  const existing = await db
    .select()
    .from(dailyTasks)
    .where(and(eq(dailyTasks.childProfileId, childId), eq(dailyTasks.clipId, clipId), eq(dailyTasks.date, today)))
    .limit(1)

  if (existing[0]) {
    await db
      .update(dailyTasks)
      .set({ completed: true })
      .where(eq(dailyTasks.id, existing[0].id))
  } else {
    await db.insert(dailyTasks).values({
      childProfileId: childId,
      clipId,
      date: today,
      taskType: "speak",
      completed: true,
    })
  }

  return NextResponse.json({ transcript, score: accuracyScore, feedback })
}
