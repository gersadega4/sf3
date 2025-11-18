import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ accounts: [] }, { status: 200 })

  const db = await getDb()
  const items = await db
    .collection("monitored_accounts")
    .find({ userId: user._id })
    .project({ _id: 0, handle: 1, name: 1, image: 1, actionAt: 1, actionType: 1 })
    .sort({ updatedAt: -1 })
    .toArray()

  return NextResponse.json({ accounts: items })
}
