"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Mode = "login" | "register"

export function AuthForm({ mode }: { mode: Mode }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? "Terjadi kesalahan")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Tidak dapat terhubung ke server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm mx-auto space-y-4 border border-border rounded-lg p-6 bg-card">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          autoComplete="username"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>
      {error && <p className="text-sm text-destructive-foreground/80">{error}</p>}
      <button
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
      >
        {loading ? "Memproses..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  )
}
