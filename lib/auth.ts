import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { getDb } from "./mongodb"

function getJwtSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) {
    throw new Error("JWT_SECRET is not set. Please add it in Project Settings.")
  }
  return s
}

export interface AppJwtPayload {
  userId: string
  iat?: number
  exp?: number
}

export function signToken(payload: object, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: maxAgeSeconds })
}

export function verifyToken<T = AppJwtPayload>(token: string): T | null {
  try {
    return jwt.verify(token, getJwtSecret()) as T
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  const data = verifyToken<AppJwtPayload>(token)
  if (!data?.userId) return null

  const db = await getDb()
  const { ObjectId } = await import("mongodb")
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(data.userId) }, { projection: { passwordHash: 0 } })
  if (!user) return null
  return { _id: user._id.toString(), username: user.username as string }
}
