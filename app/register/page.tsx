import Link from "next/link"
import { AuthForm } from "@/components/auth-form"

export default function RegisterPage() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Register</h1>
          <p className="text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </main>
  )
}
