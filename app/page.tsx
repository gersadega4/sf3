import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold text-balance">Pantau Profil X yang Anda Pilih</h1>
        <p className="text-muted-foreground leading-relaxed">
          Login atau daftar, lalu tambahkan beberapa handle X sekaligus. Kami akan mengekstrak nama dan foto profil
          untuk Anda.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  )
}
