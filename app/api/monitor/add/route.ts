import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

function extractHandles(text: string): string[] {
  const set = new Set<string>()
  const re = /@([A-Za-z0-9_]{1,30})/g
  let m
  while ((m = re.exec(text)) !== null) set.add(m[1])
  return Array.from(set)
}

async function getOrFetchProfile(handle: string, db: Awaited<ReturnType<typeof getDb>>) {
  const cached = await db.collection("profiles").findOne({ handle })
  if (cached && cached.updatedAt && Date.now() - new Date(cached.updatedAt).getTime() < 1000 * 60 * 60 * 24) {
    return { name: cached.name as string, image: cached.image as string | undefined }
  }

  const url = `https://x.com/${handle}`
  let html = ""
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 v0-monitor",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    })
    html = await res.text()
  } catch {
    // ignore network errors
  }

  const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
  const imageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)

  let name = handle
  if (titleMatch?.[1]) {
    const t = titleMatch[1]
    const idx = t.indexOf("(@")
    name = idx > 0 ? t.slice(0, idx).trim() : t
  }

  let image = imageMatch?.[1]

  // Fallback 1: unavatar (returns JSON with url)
  if (!image) {
    try {
      const ua = await fetch(`https://unavatar.io/x/${handle}?json`, { cache: "no-store" })
      if (ua.ok) {
        const j = await ua.json().catch(() => null as any)
        image = (j && (j.url || j?.avatars?.[0]?.url)) || undefined
      }
    } catch {
      // ignore
    }
  }

  // Fallback 2: twivatar (simple redirectable PNG)
  if (!image) {
    image = `https://twivatar.glitch.me/${handle}`
  }

  await db
    .collection("profiles")
    .updateOne({ handle }, { $set: { handle, name, image, updatedAt: new Date() } }, { upsert: true })

  return { name, image }
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { text } = await req.json()
  if (!text || typeof text !== "string") return NextResponse.json({ error: "Masukkan teks handle" }, { status: 400 })

  const handles = extractHandles(text)
  if (handles.length === 0) return NextResponse.json({ error: "Tidak ada handle ditemukan" }, { status: 400 })

  const db = await getDb()

  const results = await Promise.all(
    handles.map(async (h) => {
      const profile = await getOrFetchProfile(h, db)
      await db.collection("monitored_accounts").updateOne(
        { userId: user._id, handle: h },
        {
          $set: {
            userId: user._id,
            handle: h,
            name: profile.name,
            image: profile.image,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      )
      return { handle: h, ...profile }
    }),
  )

  return NextResponse.json({ ok: true, added: results.length, accounts: results })
}
