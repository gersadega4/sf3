import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const u = searchParams.get("u")
  if (!u) {
    return new Response("Missing u", { status: 400 })
  }

  const username = u.replace(/^@/, "").trim().toLowerCase()
  const sources = [
    // Try twivatar first
    `https://twivatar.glitch.me/${encodeURIComponent(username)}`,
    // Then unavatar twitter
    `https://unavatar.io/twitter/${encodeURIComponent(username)}`,
  ]

  for (const url of sources) {
    try {
      const res = await fetch(url, { redirect: "follow", cache: "no-store" })
      if (res.ok) {
        const contentType = res.headers.get("content-type") ?? "image/jpeg"
        const body = await res.arrayBuffer()
        return new Response(body, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=21600, s-maxage=21600",
          },
        })
      }
    } catch {
      // ignore and try next
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <rect width="100%" height="100%" fill="#111"/>
      <circle cx="64" cy="48" r="24" fill="#333"/>
      <rect x="28" y="84" width="72" height="28" rx="14" fill="#333"/>
    </svg>
  `.trim()

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  })
}
