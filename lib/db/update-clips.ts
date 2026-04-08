import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)

const clips = [
  { orderNum: 1,  text: 'The pirates are here!',                    startSec: 126.8, endSec: 133.0 },
  { orderNum: 2,  text: 'Why were you in a barrel?',                startSec: 224.8, endSec: 233.0 },
  { orderNum: 3,  text: "I want to be King of the Pirates!",        startSec: 240.4, endSec: 249.6 },
  { orderNum: 4,  text: "I'm a pirate!",                            startSec: 324.4, endSec: 330.0 },
  { orderNum: 5,  text: 'I need a crew!',                           startSec: 391.4, endSec: 396.2 },
  { orderNum: 6,  text: 'Can you guys keep it down?',               startSec: 450.9, endSec: 456.0 },
  { orderNum: 7,  text: 'Join my crew!',                            startSec: 766.4, endSec: 770.2 },
  { orderNum: 8,  text: "I'm not interested in joining your crew.", startSec: 770.2, endSec: 781.2 },
  { orderNum: 9,  text: "I'm going to be King of the Pirates!",     startSec: 945.9, endSec: 950.0 },
  { orderNum: 10, text: "I'm going to join the Marines!",           startSec: 1131.4, endSec: 1136.0 },
]

async function run() {
  for (const c of clips) {
    await sql`UPDATE clips SET text=${c.text}, start_sec=${c.startSec}, end_sec=${c.endSec} WHERE order_num=${c.orderNum}`
    console.log('✓', c.orderNum, c.text)
  }
  console.log('✅ 完成')
  process.exit(0)
}

run().catch(console.error)
