import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { handle, actionType: rawType } = await req.json().catch(() => ({}))
  if (!handle || typeof handle !== "string") {
    return NextResponse.json({ error: "Handle tidak valid" }, { status: 400 })
  }
  const actionType = "check" as const

  const db = await getDb()
  const now = new Date()
  await db.collection("monitored_accounts").updateOne(
    { userId: user._id, handle },
    {
      $set: {
        actionType,
        actionAt: now,
        updatedAt: now,
      },
    },
  )

  return NextResponse.json({ ok: true, handle, actionType, actionAt: now.toISOString() })
}
