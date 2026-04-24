'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

type NavItem = { href: string; label: string }

function buildNav(role: Role): NavItem[] {
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/posts', label: 'Posts' },
  ]

  if (role === 'author') {
    items.push({ href: '/create-posts', label: 'Create Post' })
  }

  if (role === 'admin') {
    items.push({ href: '/admin', label: 'Admin' })
  }

  return items
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [role, setRole] = useState<Role>('viewer')
  const nav = buildNav(role)

  useEffect(() => {
    let mounted = true

    ;(async () => {
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
    ;(async () => {
      const { role } = await getCurrentUserRole()
      if (mounted) setRole(role)
    })()
    return () => {
      mounted = false
    }
  }, [])

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/60 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold tracking-tight text-white">
            Dashboard
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'rounded-lg px-3 py-1.5 text-sm transition',
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {email ? (
            <span className="hidden text-sm text-white/70 sm:inline">{email}</span>
          ) : (
            <span className="hidden text-sm text-white/40 sm:inline">Not signed in</span>
          )}

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </header>
  )
}