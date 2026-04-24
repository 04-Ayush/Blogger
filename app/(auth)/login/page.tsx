'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loginSchema } from '@/lib/validations/auth'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    setErrorMessage('')

    const validation = loginSchema.safeParse({
      email,
      password,
    })

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0].message)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage('Invalid email or password')
      return
    }

    if (data.user) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Welcome Back
              </h2>
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Email
                </label>

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                  Password
                </label>

                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  type="password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400">
                  {errorMessage}
                </p>
              )}

              <button
                className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 active:translate-y-px"
                onClick={handleLogin}
              >
                Login
              </button>

              <p className="pt-2 text-center text-sm text-white/50">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-emerald-400">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}