import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { signToken } from "@/lib/auth"

export async function POST(req: Request) {
  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 })
  }

  const db = await getDb()
  const user = await db.collection("users").findOne({ username: String(username).toLowerCase() })
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
  }

  const ok = await bcrypt.compare(String(password), String(user.passwordHash))
  if (!ok) {
    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 })
  }

  const token = signToken({ userId: user._id.toString() })
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
