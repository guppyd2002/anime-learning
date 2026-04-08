import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg space-y-6">
        <div className="text-7xl mb-2">🏴‍☠️</div>
        <h1 className="text-4xl font-bold tracking-tight">
          One Piece<br />
          <span className="text-yellow-400">英語學習平台</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          跟著魯夫一起學英文！<br />
          聽 → 跟讀 → AI 批改 → 累積點數
        </p>

        <div className="flex flex-col gap-3 items-center pt-2">
          {userId ? (
            <Link href="/dashboard">
              <Button size="lg" className="w-48 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                進入儀表板
              </Button>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <Button size="lg" className="w-48 bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                開始學習
              </Button>
            </SignInButton>
          )}
        </div>

        <div className="flex justify-center gap-8 pt-4 text-sm text-zinc-500">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🎬</span>
            <span>30個學習片段</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🎤</span>
            <span>跟讀錄音</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🤖</span>
            <span>AI發音批改</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⭐</span>
            <span>點數獎勵</span>
          </div>
        </div>
      </div>
    </div>
  )
}
