import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

const CLIPS = [
  { text: "I'm gonna be the King of the Pirates!", level: 'A', orderNum: 1, startSec: 30, endSec: 35 },
  { text: "Let's go!", level: 'A', orderNum: 2, startSec: 60, endSec: 63 },
  { text: "No way!", level: 'A', orderNum: 3, startSec: 90, endSec: 93 },
  { text: "Watch out!", level: 'A', orderNum: 4, startSec: 120, endSec: 123 },
  { text: "Stop it!", level: 'A', orderNum: 5, startSec: 150, endSec: 153 },
  { text: "Come on!", level: 'A', orderNum: 6, startSec: 180, endSec: 183 },
  { text: "Hurry up!", level: 'A', orderNum: 7, startSec: 210, endSec: 213 },
  { text: "It's dangerous!", level: 'A', orderNum: 8, startSec: 240, endSec: 244 },
  { text: "Leave it to me!", level: 'A', orderNum: 9, startSec: 270, endSec: 274 },
  { text: "I can do it!", level: 'A', orderNum: 10, startSec: 300, endSec: 304 },
  { text: "I will never give up!", level: 'B', orderNum: 11, startSec: 330, endSec: 335 },
  { text: "I have a dream.", level: 'B', orderNum: 12, startSec: 360, endSec: 365 },
  { text: "I want to become stronger.", level: 'B', orderNum: 13, startSec: 390, endSec: 396 },
  { text: "You can't stop me!", level: 'B', orderNum: 14, startSec: 420, endSec: 425 },
  { text: "I will protect my friends.", level: 'B', orderNum: 15, startSec: 450, endSec: 456 },
  { text: "This is my journey.", level: 'B', orderNum: 16, startSec: 480, endSec: 485 },
  { text: "I don't care what happens.", level: 'B', orderNum: 17, startSec: 510, endSec: 516 },
  { text: "I won't lose!", level: 'B', orderNum: 18, startSec: 540, endSec: 544 },
  { text: "This is just the beginning.", level: 'B', orderNum: 19, startSec: 570, endSec: 576 },
  { text: "I made a promise.", level: 'B', orderNum: 20, startSec: 600, endSec: 605 },
  { text: "What are you doing?", level: 'C', orderNum: 21, startSec: 630, endSec: 634 },
  { text: "Why are you here?", level: 'C', orderNum: 22, startSec: 660, endSec: 664 },
  { text: "What is your dream?", level: 'C', orderNum: 23, startSec: 690, endSec: 695 },
  { text: "Do you want to join me?", level: 'C', orderNum: 24, startSec: 720, endSec: 726 },
  { text: "Are you afraid?", level: 'C', orderNum: 25, startSec: 750, endSec: 754 },
  { text: "What happened?", level: 'C', orderNum: 26, startSec: 780, endSec: 784 },
  { text: "Who are you?", level: 'C', orderNum: 27, startSec: 810, endSec: 814 },
  { text: "What should we do?", level: 'C', orderNum: 28, startSec: 840, endSec: 845 },
  { text: "Do you understand?", level: 'C', orderNum: 29, startSec: 870, endSec: 875 },
  { text: "Are you ready?", level: 'C', orderNum: 30, startSec: 900, endSec: 904 },
]

async function seed() {
  console.log('🌱 建立資料表...')

  await sql`CREATE TABLE IF NOT EXISTS clips (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    youtube_id TEXT NOT NULL DEFAULT '2Bh7WwjIex0',
    start_sec REAL NOT NULL DEFAULT 0,
    end_sec REAL NOT NULL DEFAULT 5,
    level TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`

  await sql`CREATE TABLE IF NOT EXISTS child_profiles (
    id SERIAL PRIMARY KEY,
    parent_user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    avatar TEXT DEFAULT '🏴‍☠️',
    created_at TIMESTAMP DEFAULT NOW()
  )`

  await sql`CREATE TABLE IF NOT EXISTS points (
    id SERIAL PRIMARY KEY,
    child_profile_id INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
  )`

  await sql`CREATE TABLE IF NOT EXISTS recordings (
    id SERIAL PRIMARY KEY,
    child_profile_id INTEGER NOT NULL,
    clip_id INTEGER NOT NULL,
    blob_url TEXT NOT NULL,
    transcript TEXT,
    accuracy_score REAL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`

  await sql`CREATE TABLE IF NOT EXISTS daily_tasks (
    id SERIAL PRIMARY KEY,
    child_profile_id INTEGER NOT NULL,
    clip_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    task_type TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`

  const existing = await sql`SELECT COUNT(*) FROM clips`
  if (Number(existing[0].count) === 0) {
    for (const clip of CLIPS) {
      await sql`INSERT INTO clips (text, youtube_id, start_sec, end_sec, level, order_num)
        VALUES (${clip.text}, ${'2Bh7WwjIex0'}, ${clip.startSec}, ${clip.endSec}, ${clip.level}, ${clip.orderNum})`
    }
    console.log(`✅ 插入 ${CLIPS.length} 個 clips`)
  } else {
    console.log('⏭️  Clips 已存在，跳過')
  }

  console.log('✅ Seed 完成')
  process.exit(0)
}

seed().catch(console.error)
