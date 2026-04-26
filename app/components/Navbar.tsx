'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

type Crumb = {
  label: string
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18 9.6a6 6 0 0 0-12 0c0 6-2 6.6-2 6.6h16s-2-.6-2-6.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
      <path
        d="M10.8 18.2a7.4 7.4 0 1 1 0-14.8 7.4 7.4 0 0 1 0 14.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M16.6 16.6 20.4 20.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [role, setRole] = useState<Role>('viewer')
  const [userId, setUserId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuRef = useRef<HTMLDivElement | null>(null)
  const initial = (email ?? '').trim().slice(0, 1).toUpperCase()


  useEffect(() => {
    let mounted = true

      ; (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (mounted) setEmail(user?.email ?? null)
      })()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
      ; (async () => {
        const current = await getCurrentUserRole()
        if (!mounted) return
        setRole(current.role)
        setUserId(current.userId)
      })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const onPointerDown = (e: PointerEvent) => {
      const root = menuRef.current
      if (!root) return
      if (e.target instanceof Node && root.contains(e.target)) return
      setMenuOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    router.push(`/posts?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
              B
            </span>
            <span className="hidden text-base font-semibold tracking-wide text-white sm:inline">Blogger</span>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {/* {crumbs.map((c, idx) => (
                <span key={`${c.label}-${idx}`} className="min-w-0 truncate">
                  {idx === 0 ? c.label : (
                    <>
                      <span className="mx-2 text-white/25">/</span>
                      {c.label}
                    </>
                  )}
                </span>
              ))} */}
            </div>
          </div>
        </div>

        <div className="hidden flex-1 md:block">
          <form onSubmit={onSubmitSearch} className="mx-auto max-w-xl">
            <div className="group relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white/60">
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts or authors…"
                className="h-10 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-3 text-sm text-white/90 outline-none placeholder:text-white/35 transition focus:border-white/20 focus:bg-white/10 focus:ring-4 focus:ring-emerald-400/10"
              />
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {email ? (
            <>
              {role === 'author' && (
                <Link
                  href="/create-posts"
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Create Post
                </Link>
              )}

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Notifications"
              >
                <IconBell />
              </button>

              <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 sm:inline">
                {role}
              </span>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-white/80">
                    {initial || '•'}
                  </span>
                  <span className="hidden max-w-44 truncate text-sm text-white/70 lg:inline">{email}</span>
                  <span className="text-white/40">▾</span>
                </button>

                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-lg shadow-black/30 backdrop-blur-xl"
                  >
                    <div className="px-4 py-3">
                      <div className="text-sm font-semibold text-white">Account</div>
                      <div className="mt-0.5 truncate text-sm text-white/60">{email}</div>
                      <div className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                        Role: {role}
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        role="menuitem"
                      >
                        {signingOut ? 'Logging out…' : 'Logout'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}