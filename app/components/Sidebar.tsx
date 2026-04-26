'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

type NavItem = {
  href: string
  label: string
  icon: 'home' | 'posts' | 'write' | 'admin' | 'explore' | 'bookmark'
  right?: string
}

type NavSection = {
  title?: string
  items: NavItem[]
}

function buildSections(role: Role): NavSection[] {
  const sections: NavSection[] = [
    {
      items: [
        { href: '/dashboard', label: 'Home', icon: 'home' },
        { href: '/posts', label: 'Blogs', icon: 'posts' },
      ],
    },
  ]

  sections.push({
    title: 'Bookmarks',
    items: [{ href: '/bookmarks', label: 'Bookmarks', icon: 'bookmark' }],
  })

  if (role === 'author') {
    sections.push({
      title: 'Author',
      items: [{ href: '/create-posts', label: 'Write', icon: 'write' }],
    })
  }

  if (role === 'admin') {
    sections.push({
      title: 'Admin',
      items: [{ href: '/admin', label: 'Admin Panel', icon: 'admin' }],
    })
  }

  return sections
}

function Icon({ name }: { name: NavItem['icon'] }) {
  const common = 'h-5 w-5'

  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path
            d="M9.5 20.5v-6.2c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9v6.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M3.5 10.6 11.3 4.2c.4-.3 1-.3 1.4 0l7.8 6.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.2 9.9v9c0 .9.7 1.6 1.6 1.6h10.4c.9 0 1.6-.7 1.6-1.6v-9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'posts':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path
            d="M7 7.5h10M7 12h10M7 16.5h7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6 3.8h12c1.2 0 2.2 1 2.2 2.2v12c0 1.2-1 2.2-2.2 2.2H6c-1.2 0-2.2-1-2.2-2.2V6C3.8 4.8 4.8 3.8 6 3.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'write':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path
            d="M8 16.2h2.3l8.7-8.7a1.6 1.6 0 0 0 0-2.3l-.3-.3a1.6 1.6 0 0 0-2.3 0l-8.7 8.7V16.2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M6.2 20.2h11.6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'admin':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path
            d="M12 3.8 19.2 7v6.2c0 4.2-2.9 7.9-7.2 9-4.3-1.1-7.2-4.8-7.2-9V7L12 3.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M9.3 12.1 11.2 14l3.6-3.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'bookmark':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path
            d="M7.5 4.6h9c.9 0 1.6.7 1.6 1.6v15.2l-6.1-3.7-6.1 3.7V6.2c0-.9.7-1.6 1.6-1.6Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState<Role | ''>('')
  const [userId, setUserId] = useState<string | null>(null)
  const sections = useMemo(() => {
    if (!role) return []

    return buildSections(role)
  }, [role])

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

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/70 backdrop-blur-xl lg:block">
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-y-auto px-3 py-4">
        <div className="px-2">
          <div className="flex items-center justify-between rounded-2xl px-2 py-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40">Navigation</div>
            <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
              {role}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-5">
          {sections.map((section) => (
            <div key={section.title ?? 'main'}>
              {section.title ? (
                <div className="px-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  {section.title}
                </div>
              ) : null}

              <nav className={section.title ? 'mt-2 space-y-1' : 'space-y-1'}>
                {section.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={[
                        'group flex items-center justify-between rounded-xl px-3 py-2.5 transition',
                        active ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={[
                            'flex h-8 w-8 items-center justify-center rounded-xl border transition',
                            active
                              ? 'border-white/10 bg-white/5 text-white'
                              : 'border-white/10 bg-transparent text-white/70 group-hover:bg-white/5 group-hover:text-white',
                          ].join(' ')}
                        >
                          <Icon name={item.icon} />
                        </span>
                        <span className="truncate text-sm font-medium">{item.label}</span>
                      </div>

                      {item.right ? (
                        <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/70">
                          {item.right}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

      </div>
    </aside>
  )
}