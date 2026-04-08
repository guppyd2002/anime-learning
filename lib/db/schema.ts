import { pgTable, serial, text, integer, boolean, timestamp, real } from 'drizzle-orm/pg-core'

// 影片（父母建立）
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  youtubeId: text('youtube_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  minAge: integer('min_age').notNull().default(7),
  maxAge: integer('max_age').notNull().default(12),
  parentUserId: text('parent_user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// 學習 Clip（屬於某支影片）
export const clips = pgTable('clips', {
  id: serial('id').primaryKey(),
  videoId: integer('video_id'),          // null = 舊版預設影片
  text: text('text').notNull(),
  youtubeId: text('youtube_id').notNull().default('2Bh7WwjIex0'),
  startSec: real('start_sec').notNull().default(0),
  endSec: real('end_sec').notNull().default(5),
  level: text('level').notNull().default('A'),
  orderNum: integer('order_num').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// 父母帳號下的孩子 profile
export const childProfiles = pgTable('child_profiles', {
  id: serial('id').primaryKey(),
  parentUserId: text('parent_user_id').notNull(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  avatar: text('avatar').default('🏴‍☠️'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 點數
export const points = pgTable('points', {
  id: serial('id').primaryKey(),
  childProfileId: integer('child_profile_id').notNull(),
  total: integer('total').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// 跟讀錄音
export const recordings = pgTable('recordings', {
  id: serial('id').primaryKey(),
  childProfileId: integer('child_profile_id').notNull(),
  clipId: integer('clip_id').notNull(),
  blobUrl: text('blob_url').notNull(),
  transcript: text('transcript'),
  accuracyScore: real('accuracy_score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow(),
})

// 每日任務完成記錄
export const dailyTasks = pgTable('daily_tasks', {
  id: serial('id').primaryKey(),
  childProfileId: integer('child_profile_id').notNull(),
  clipId: integer('clip_id').notNull(),
  date: text('date').notNull(),
  taskType: text('task_type').notNull(),
  completed: boolean('completed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
