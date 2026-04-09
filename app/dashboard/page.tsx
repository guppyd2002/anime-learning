import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { childProfiles, points, recordings, dailyTasks } from "@/lib/db/schema"
import { eq, desc, and, sql } from "drizzle-orm"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AddChildForm from "./AddChildForm"
import ClearTasksButton from "./ClearTasksButton"
import VideosTab from "./VideosTab"

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const children = await db
    .select()
    .from(childProfiles)
    .where(eq(childProfiles.parentUserId, userId))

  const childrenWithStats = await Promise.all(
    children.map(async (child) => {
      const pts = await db
        .select()
        .from(points)
        .where(eq(points.childProfileId, child.id))
        .limit(1)

      const today = new Date().toISOString().split("T")[0]
      const todayTasks = await db
        .select()
        .from(dailyTasks)
        .where(and(eq(dailyTasks.childProfileId, child.id), eq(dailyTasks.date, today)))

      const completedToday = todayTasks.filter((t) => t.completed).length

      const recentRecordings = await db
        .select()
        .from(recordings)
        .where(eq(recordings.childProfileId, child.id))
        .orderBy(desc(recordings.createdAt))
        .limit(3)

      return {
        ...child,
        totalPoints: pts[0]?.total ?? 0,
        completedToday,
        totalTasks: todayTasks.length,
        recentRecordings,
      }
    })
  )

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🏴‍☠️ 父母儀表板</h1>
          <p className="text-zinc-400 text-sm mt-1">管理孩子的學習進度</p>
        </div>
        <Link href="/admin/clips">
          <Button variant="outline" size="sm">⚙️ 管理 Clip 時間戳</Button>
        </Link>
      </div>

      <Tabs defaultValue="children">
        <TabsList>
          <TabsTrigger value="children">👶 孩子管理</TabsTrigger>
          <TabsTrigger value="videos">🎬 影片管理</TabsTrigger>
        </TabsList>

        {/* 孩子 tab */}
        <TabsContent value="children" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {childrenWithStats.map((child) => (
              <Card key={child.id} className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-2xl">{child.avatar}</span>
                    <span>{child.name}</span>
                    <Badge variant="outline" className="text-xs">{child.age}歲</Badge>
                  </CardTitle>
                  <span className="text-yellow-400 font-bold">⭐ {child.totalPoints}</span>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 今日任務 */}
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">今日任務</p>
                    {child.totalTasks > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${(child.completedToday / child.totalTasks) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400">{child.completedToday}/{child.totalTasks}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600">今日尚無任務</p>
                    )}
                  </div>

                  {/* 近期錄音 */}
                  {child.recentRecordings.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">近期錄音</p>
                      <div className="space-y-2">
                        {child.recentRecordings.map((rec) => (
                          <div key={rec.id} className="flex items-center justify-between bg-zinc-800 rounded px-3 py-2">
                            <div className="flex items-center gap-2">
                              <audio src={rec.blobUrl} controls className="h-6 w-32" />
                              {rec.accuracyScore != null && (
                                <Badge className={rec.accuracyScore >= 80 ? "bg-green-700" : rec.accuracyScore >= 60 ? "bg-yellow-700" : "bg-red-800"}>
                                  {Math.round(rec.accuracyScore)}分
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500">
                              {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString("zh-TW") : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Link href={`/learn/${child.id}`} className="flex-1">
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                        切換到 {child.name} 的學習頁
                      </Button>
                    </Link>
                    <ClearTasksButton childId={child.id} childName={child.name} />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 新增孩子 */}
            <AddChildForm />
          </div>
        </TabsContent>

        {/* 影片 tab */}
        <TabsContent value="videos" className="mt-6">
          <VideosTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
