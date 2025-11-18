"use client"

import type React from "react"

import { useState } from "react"
import { mutate } from "swr"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export function AccountsInput() {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  // force revalidate helper
  const revalidate = () => mutate("/api/monitor/list")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/monitor/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error ?? "Gagal menambahkan akun")
      } else {
        setText("")
        revalidate()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="text-sm font-medium">Tempel handle X (contoh: {"@user1 @user2 @user3"})</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="@user1 @user2 @user3"
        className="w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 outline-none"
      />
      <div className="flex justify-end">
        <button
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          {loading ? "Memproses..." : "Tambah Akun"}
        </button>
      </div>
    </form>
  )
}
