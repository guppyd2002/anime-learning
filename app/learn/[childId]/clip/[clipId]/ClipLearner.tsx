"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import SpeakableText from "@/components/learn/SpeakableText"

type Clip = {
  id: number
  text: string
  youtubeId: string
  startSec: number
  endSec: number
  level: string
  orderNum: number
}

type Recording = {
  id: number
  blobUrl: string
  transcript: string | null
  accuracyScore: number | null
  feedback: string | null
  createdAt: Date | null
}

type Step = "watch" | "listen" | "record" | "result"

export default function ClipLearner({
  clip,
  childId,
  pastRecordings,
}: {
  clip: Clip
  childId: number
  pastRecordings: Recording[]
}) {
  const [step, setStep] = useState<Step>("watch")
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{ transcript: string; score: number; feedback: string } | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const ytSrc = `https://www.youtube.com/embed/${clip.youtubeId}?start=${Math.floor(clip.startSec)}&end=${Math.floor(clip.endSec)}&autoplay=1&rel=0`

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    chunksRef.current = []
    mr.ondataavailable = (e) => chunksRef.current.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      setAudioBlob(blob)
      setAudioUrl(URL.createObjectURL(blob))
      stream.getTracks().forEach((t) => t.stop())
    }
    mr.start()
    mediaRef.current = mr
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
  }, [])

  const submitRecording = useCallback(async () => {
    if (!audioBlob) return
    setAnalyzing(true)
    try {
      const form = new FormData()
      form.append("audio", audioBlob, "recording.webm")
      form.append("clipId", String(clip.id))
      form.append("childId", String(childId))
      form.append("targetText", clip.text)

      const res = await fetch("/api/analyze", { method: "POST", body: form })
      const data = await res.json()
      setResult(data)
      setStep("result")
    } finally {
      setAnalyzing(false)
    }
  }, [audioBlob, clip.id, clip.text, childId])

  const scoreColor = (s: number) =>
    s >= 80 ? "text-green-400" : s >= 60 ? "text-yellow-400" : "text-red-400"

  return (
    <div className="space-y-4">
      {/* 步驟指示 */}
      <div className="flex gap-2">
        {(["watch", "listen", "record", "result"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full transition-all ${step === s ? "bg-yellow-400" : i < ["watch", "listen", "record", "result"].indexOf(step) ? "bg-yellow-700" : "bg-zinc-700"}`}
          />
        ))}
      </div>

      {/* Step 1: 觀看 */}
      {step === "watch" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-zinc-400">Step 1 — 觀看片段 2~3 次，不用懂每個字</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={ytSrc}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              onClick={() => setStep("listen")}
            >
              看完了 → Step 2
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: 理解 */}
      {step === "listen" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-zinc-400">Step 2 — 開英文字幕再看一次，記住這句話的感覺</p>
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${clip.youtubeId}?start=${Math.floor(clip.startSec)}&end=${Math.floor(clip.endSec)}&autoplay=1&cc_load_policy=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <SpeakableText text={clip.text} large />
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
              onClick={() => setStep("record")}
            >
              準備好了 → 開始跟讀
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: 錄音 */}
      {step === "record" && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-zinc-400">Step 3 — 模仿角色的語氣，大聲說出來！</p>
            <div className="bg-zinc-800 rounded-lg p-4">
              <SpeakableText text={clip.text} large />
            </div>

            <div className="flex flex-col items-center gap-4">
              {!recording && !audioUrl && (
                <Button
                  size="lg"
                  className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-500 text-white text-4xl"
                  onClick={startRecording}
                >
                  🎤
                </Button>
              )}
              {recording && (
                <Button
                  size="lg"
                  className="w-32 h-32 rounded-full bg-red-800 hover:bg-red-700 text-white text-4xl animate-pulse"
                  onClick={stopRecording}
                >
                  ⏹️
                </Button>
              )}
              {recording && (
                <p className="text-red-400 text-sm animate-pulse">錄音中... 點 ⏹️ 停止</p>
              )}
            </div>

            {audioUrl && (
              <div className="space-y-3">
                <audio src={audioUrl} controls className="w-full" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setAudioUrl(null); setAudioBlob(null) }}
                  >
                    重錄
                  </Button>
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                    onClick={submitRecording}
                    disabled={analyzing}
                  >
                    {analyzing ? "AI 分析中..." : "提交給 AI 批改 →"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: 結果 */}
      {step === "result" && result && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-zinc-400">Step 4 — AI 批改結果</p>

            <div className="text-center space-y-2">
              <p className={`text-6xl font-bold ${scoreColor(result.score)}`}>
                {Math.round(result.score)}
              </p>
              <p className="text-zinc-400 text-sm">/ 100 分</p>
              <Progress value={result.score} className="h-3" />
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
              <p className="text-xs text-zinc-500">你說的</p>
              <p className="text-sm text-zinc-300">"{result.transcript}"</p>
              <p className="text-xs text-zinc-500 mt-2">目標</p>
              <p className="text-sm text-yellow-400">"{clip.text}"</p>
            </div>

            {result.feedback && (
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">AI 建議</p>
                <p className="text-sm text-zinc-300">{result.feedback}</p>
              </div>
            )}

            {result.score >= 80 && (
              <div className="text-center text-yellow-400 font-bold text-lg animate-bounce">
                🌟 太棒了！獲得 10 點！
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setStep("record")
                setAudioUrl(null)
                setAudioBlob(null)
                setResult(null)
              }}>
                再試一次
              </Button>
              <Button
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                onClick={() => window.history.back()}
              >
                完成 ✓
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 歷史紀錄 */}
      {pastRecordings.length > 0 && step !== "result" && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">過去的嘗試</p>
          <div className="space-y-2">
            {pastRecordings.map((rec) => (
              <div key={rec.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <audio src={rec.blobUrl} controls className="h-8 flex-1" />
                {rec.accuracyScore != null && (
                  <Badge className={rec.accuracyScore >= 80 ? "bg-green-700" : rec.accuracyScore >= 60 ? "bg-yellow-700" : "bg-red-800"}>
                    {Math.round(rec.accuracyScore)}分
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
