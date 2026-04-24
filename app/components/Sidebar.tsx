'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

type NavItem = {
  href: string
  label: string
  description?: string
}

function buildNav(role: Role): NavItem[] {
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', description: 'Role, stats, quick actions' },
    { href: '/posts', label: 'Posts', description: 'Browse posts' },
  ]

  if (role === 'author') {
    items.splice(2, 0, { href: '/create-posts', label: 'Create Post', description: 'Write a new post' })
  }

  if (role === 'admin') {
    items.push({ href: '/admin', label: 'Admin', description: 'Admin panel' })
  }

  return items
}

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<Role>('viewer')
  const nav = useMemo(() => buildNav(role), [role])

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

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950/60 backdrop-blur lg:block">
      <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-4">
        <div className="mb-3 px-2">
          <div className="text-xs font-medium uppercase tracking-wider text-white/40">
            Workspace
          </div>
          <div className="mt-1 text-sm font-semibold text-white">Dashboard</div>
        </div>

        <nav className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group block rounded-xl border px-3 py-2 transition',
                  active
                    ? 'border-white/10 bg-white/10'
                    : 'border-transparent hover:border-white/10 hover:bg-white/5',
                ].join(' ')}
              >
                <div className={active ? 'text-sm font-medium text-white' : 'text-sm font-medium text-white/80 group-hover:text-white'}>
                  {item.label}
                </div>
                {item.description ? (
                  <div className={active ? 'mt-0.5 text-xs text-white/60' : 'mt-0.5 text-xs text-white/40 group-hover:text-white/60'}>
                    {item.description}
                  </div>
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-sm font-medium text-white">Tip</div>
          <div className="mt-1 text-xs leading-5 text-white/60">
            Use the sidebar to navigate between dashboard sections.
          </div>
        </div>
      </div>
    </aside>
  )
}