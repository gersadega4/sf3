import Link from "next/link"
import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Login</h1>
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  )
}
