"use client"

import useSWR from "swr"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useEffect, useState } from "react"
import fetcher from "@/utils/fetcher"

type Account = {
  handle: string
  name: string
  image?: string
  actionAt?: string
  actionType?: "check" | "cross"
}

function isActive(actionAt?: string, now?: number) {
  if (!actionAt || !now) return false
  const t = new Date(actionAt).getTime()
  return now - t < 24 * 60 * 60 * 1000
}

function formatClickedTime(actionAt?: string) {
  if (!actionAt) return ""
  const d = new Date(actionAt)
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

function AvatarImage({ handle, image }: { handle: string; image?: string }) {
  const initial = `/api/avatar?u=${handle}`
  const [src, setSrc] = useState(initial)
  useEffect(() => {
    setSrc(initial)
  }, [initial])

  function onImgError() {
    // final fallback to placeholder
    setSrc(`/placeholder.svg?height=48&width=48&query=Default%20X%20avatar`)
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={`Avatar ${handle}`}
      fill
      sizes="48px"
      className="object-cover"
      onError={onImgError}
    />
  )
}

export function AccountsList() {
  const { data, error, isLoading, mutate } = useSWR<{ accounts: Account[] }>("/api/monitor/list", fetcher)

  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<number | undefined>(undefined)
  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(i)
  }, [])

  async function setAction(handle: string) {
    const res = await fetch("/api/monitor/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, actionType: "check" }),
    })
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}))
      alert(msg?.error || "Gagal menyimpan aksi")
      return
    }
    await mutate()
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Memuat...</p>
  if (error) return <p className="text-sm text-destructive-foreground">Gagal memuat data</p>

  const accounts = data?.accounts ?? []

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((acc) => {
        const active = mounted ? isActive(acc.actionAt, now) : false
        const isGreen = active && acc.actionType === "check"

        const checkBtnClass = isGreen
          ? "bg-success text-[color:var(--success-foreground)] hover:bg-success/90"
          : "bg-destructive text-[color:var(--destructive-foreground)] hover:bg-destructive/90"

        const infoText = isGreen
          ? `baru saja di klik pada ${mounted ? formatClickedTime(acc.actionAt) : ""}`
          : "sf ini blum di raid"

        return (
          <div
            key={acc.handle}
            className="group rounded-lg border border-border p-4 hover:shadow-sm transition flex flex-col gap-4"
          >
            <a
              href={`https://x.com/${acc.handle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4"
            >
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0">
                <AvatarImage handle={acc.handle} image={acc.image} />
              </div>
              <div className="min-w-0">
                <div className="font-medium truncate">{acc.name || acc.handle}</div>
                <div className="text-sm text-muted-foreground truncate">@{acc.handle}</div>
              </div>
            </a>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  className={`h-9 w-9 p-0 ${checkBtnClass}`}
                  aria-label="Tandai centang"
                  onClick={() => setAction(acc.handle)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                {infoText}
              </div>
            </div>
          </div>
        )
      })}
      {accounts.length === 0 && <p className="text-sm text-muted-foreground">Belum ada akun dipantau.</p>}
    </div>
  )
}
