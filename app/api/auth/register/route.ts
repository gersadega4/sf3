import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 })
  }
  if (String(username).length < 3 || String(password).length < 6) {
    return NextResponse.json({ error: "Username min 3, password min 6 karakter" }, { status: 400 })
  }

  const db = await getDb()
  const exist = await db.collection("users").findOne({ username: String(username).toLowerCase() })
  if (exist) {
    return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(String(password), 10)
  const now = new Date()
  const insert = await db.collection("users").insertOne({
    username: String(username).toLowerCase(),
    passwordHash,
    createdAt: now,
  })

  const token = signToken({ userId: insert.insertedId.toString() })
  const res = NextResponse.json({ ok: true })
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
