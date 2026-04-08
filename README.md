# 🏴‍☠️ One Piece 英語學習平台

用海賊王動畫讓 9-11 歲孩子學英文。

---

## 功能

| 功能 | 說明 |
|---|---|
| 🎬 YouTube Clip 播放 | 指定片段自動播放 |
| 🔊 AI 語音朗讀 | 整句 / 逐字朗讀，點單字顯示中文 |
| 🎤 跟讀錄音 | 瀏覽器錄音，上傳 Vercel Blob |
| 🤖 AI 發音批改 | Whisper 轉文字 + GPT-4o-mini 給分 |
| ⭐ 點數系統 | 80分以上 +10點，60分以上 +5點 |
| 👨‍👩‍👧 多帳號 | 父母帳號下管理多個孩子 |
| 📊 父母儀表板 | 查看進度、回聽錄音 |

---

## 快速開始

```bash
git clone https://github.com/guppyd2002/anime-learning.git
cd anime-learning
npm install
vercel link && vercel env pull .env.local --yes
npm run db:seed
npm run dev
```

開啟 http://localhost:3000

---

## 環境變數

| 變數 | 來源 |
|---|---|
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | clerk.com |
| CLERK_SECRET_KEY | clerk.com |
| DATABASE_URL | Neon (Vercel Marketplace) |
| BLOB_READ_WRITE_TOKEN | Vercel Blob (Vercel Dashboard) |
| OPENAI_API_KEY | platform.openai.com |

---

## 專案結構

```
app/
  page.tsx                    # 首頁
  dashboard/                  # 父母儀表板
  learn/[childId]/            # 孩子學習頁
    clip/[clipId]/
      ClipLearner.tsx         # 錄音 + TTS + AI 批改
  admin/clips/                # 管理 Clip 時間戳
  api/
    analyze/route.ts          # 錄音分析 API
    children/route.ts         # 建立孩子帳號
    clips/[id]/route.ts       # 更新 Clip
components/
  learn/SpeakableText.tsx     # 點擊朗讀 + 中文意思
lib/
  db/schema.ts                # Drizzle Schema
  db/seed.ts                  # 初始資料（30 clips）
  translations.ts             # 中英文對照字典
proxy.ts                      # Clerk 認證 Middleware
```

---

## 資料庫 Schema

| 表 | 說明 |
|---|---|
| clips | 30 個學習片段（YouTube ID + 起訖秒 + 難度） |
| child_profiles | 孩子帳號（連結父母 Clerk userId） |
| recordings | 錄音檔（Blob URL + 分數 + AI 建議） |
| daily_tasks | 每日任務完成記錄 |
| points | 累積點數 |

---

## 技術架構

- **Next.js 16** App Router + Turbopack
- **Clerk v7** — 使用者認證
- **Neon Postgres** + Drizzle ORM — 資料庫
- **Vercel Blob** — 錄音音檔儲存
- **OpenAI** Whisper + GPT-4o-mini — AI 批改
- **Web Speech API** — TTS 朗讀（免費）
- **shadcn/ui** — UI 元件

---

## 維護手冊

### 修改 Clip 時間戳
1. 線上：http://localhost:3000/admin/clips
2. 批次：修改 `lib/db/update-clips.ts` 後執行 `npx dotenv -e .env.local -- npx tsx lib/db/update-clips.ts`

### 新增翻譯
編輯 `lib/translations.ts`：
- `SENTENCE_ZH` — 整句中文
- `WORD_ZH` — 單字對照

### 輪換 API Key
```bash
vercel env rm OPENAI_API_KEY development
echo "sk-新的key" | vercel env add OPENAI_API_KEY development
vercel env pull .env.local --yes
```

---

## 問題回報

[GitHub Issues](https://github.com/guppyd2002/anime-learning/issues)

**Bug 回報請提供：**
- 問題描述
- 重現步驟
- 瀏覽器 / 帳號類型

**功能建議請提供：**
- 功能描述
- 使用情境
