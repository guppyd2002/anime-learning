"use client"

import { useCallback, useRef, useState } from "react"
import { SENTENCE_ZH, getWordZh } from "@/lib/translations"

type Props = {
  text: string
  large?: boolean
}

export default function SpeakableText({ text, large = false }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [activeWord, setActiveWord] = useState<number | null>(null)
  const [popupWord, setPopupWord] = useState<{ idx: number; word: string; zh: string } | null>(null)

  const sentenceZh = SENTENCE_ZH[text]
  const words = text.split(/\s+/)

  const speak = useCallback((str: string) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(str)
    u.lang = "en-US"
    u.rate = 0.82
    u.pitch = 1.1
    return u
  }, [])

  const speakSentence = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      setActiveWord(null)
      return
    }
    const u = speak(text)
    u.onboundary = (e) => {
      if (e.name === "word") {
        const idx = text.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length
        setActiveWord(idx)
      }
    }
    u.onend = () => { setSpeaking(false); setActiveWord(null) }
    window.speechSynthesis.speak(u)
    setSpeaking(true)
    setPopupWord(null)
  }, [text, speaking, speak])

  const speakWord = useCallback((word: string, idx: number) => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setActiveWord(idx)
    const clean = word.replace(/[^\w']/g, "")
    const u = speak(clean || word)
    u.rate = 0.72
    u.onend = () => setActiveWord(null)
    window.speechSynthesis.speak(u)

    const zh = getWordZh(clean || word)
    setPopupWord(zh ? { idx, word, zh } : null)
  }, [speak])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 整句朗讀按鈕 */}
      <button
        onClick={speakSentence}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
          ${speaking
            ? "bg-yellow-500 text-black animate-pulse"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
          }`}
      >
        <span className="text-base">{speaking ? "⏹️" : "🔊"}</span>
        <span>{speaking ? "停止" : "朗讀整句"}</span>
      </button>

      {/* 句子（可逐字點擊） */}
      <div className={`flex flex-wrap gap-x-1 gap-y-6 justify-center relative ${large ? "gap-x-2" : ""}`}>
        {words.map((word, idx) => {
          const clean = word.replace(/[^\w']/g, "")
          const isActive = activeWord === idx
          const hasZh = !!getWordZh(clean || word)
          const isPopupOpen = popupWord?.idx === idx

          return (
            <div key={idx} className="relative flex flex-col items-center">
              <button
                onClick={() => speakWord(word, idx)}
                className={`rounded px-1.5 py-0.5 transition-all cursor-pointer select-none
                  ${large ? "text-2xl font-bold" : "text-lg font-semibold"}
                  ${isActive || isPopupOpen
                    ? "bg-yellow-400 text-black scale-110 shadow-lg shadow-yellow-400/30"
                    : `text-yellow-400 hover:bg-zinc-700 hover:text-white active:scale-95 ${hasZh ? "underline decoration-dotted underline-offset-4" : ""}`
                  }`}
              >
                {word}
              </button>

              {/* 單字中文 popup */}
              {isPopupOpen && (
                <div className="absolute top-full mt-1 z-20 whitespace-nowrap bg-zinc-800 border border-yellow-500/50 rounded-lg px-3 py-1.5 shadow-xl">
                  <p className="text-xs text-zinc-400 mb-0.5">{popupWord.word}</p>
                  <p className="text-sm font-bold text-yellow-400">{popupWord.zh}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 整句中文 */}
      {sentenceZh && (
        <div className="text-center">
          <p className="text-zinc-400 text-sm">{sentenceZh}</p>
        </div>
      )}

      <p className="text-xs text-zinc-600">點擊單字：發音 + 中文意思</p>
    </div>
  )
}
