'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('viewer')
  const router = useRouter()

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.log('Auth Error:', error.message)
      return
    }

    if (data.user) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          name: name,
          email: email,
          role : role,
        },
      ])

      router.push('/dashboard')

      if (insertError) {
        console.log('Insert Error:', insertError.message)
      } else {
        console.log('User inserted successfully')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left marketing panel (hidden on small screens) */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                Blogger
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Create your account
              </div>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white">
                Start writing in minutes.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
                Publish posts, manage your profile, and keep everything synced securely.
              </p>


            </div>
          </div>

          {/* Right auth card */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-white">Create account</h2>
                <p className="mt-2 text-sm text-white/70">
                  Use a real email — you may need to verify it.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Email</label>
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
                  <label className="text-sm font-medium text-white/80">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    type="password"
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">
                    Select Role
                  </label>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-white/70">
                      <input
                        type="radio"
                        value="viewer"
                        checked={role === 'viewer'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      Viewer
                    </label>

                    <label className="flex items-center gap-2 text-white/70">
                      <input
                        type="radio"
                        value="author"
                        checked={role === 'author'}
                        onChange={(e) => setRole(e.target.value)}
                      />
                      Author
                    </label>
                  </div>
                </div>

                <button
                  className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 active:translate-y-px"
                  onClick={handleRegister}
                >
                  Register
                </button>

                <p className="pt-2 text-center text-xs text-white/50">
                  By registering, you agree to our basic usage terms.
                </p>
                <p className="pt-2 text-center text-s text-white/50">
                  Already have an account?<Link href="/login" className='text-emerald-400'> Login
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}