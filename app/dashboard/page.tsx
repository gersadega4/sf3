import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AccountsInput } from "@/components/dashboard/accounts-input"
import { AccountsList } from "@/components/dashboard/accounts-list"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Login sebagai <span className="font-medium">{user.username}</span>
          </p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium">
            Logout
          </button>
        </form>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tambah Akun X</h2>
        <AccountsInput />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Akun yang Dipantau</h2>
        <AccountsList />
      </section>
    </main>
  )
}
