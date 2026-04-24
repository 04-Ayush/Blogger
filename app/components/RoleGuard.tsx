'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

type Props = {
  allowed: Role[]
  redirectTo: string
  children: React.ReactNode
}

export default function RoleGuard({ allowed, redirectTo, children }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const { userId, role } = await getCurrentUserRole()

      if (cancelled) return

      if (!userId) {
        setStatus('denied')
        router.push('/login')
        return
      }

      if (!allowed.includes(role)) {
        setStatus('denied')
        router.push(redirectTo)
        return
      }

      setStatus('allowed')
    })()

    return () => {
      cancelled = true
    }
  }, [allowed, redirectTo, router])

  if (status !== 'allowed') {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        Loading…
      </div>
    )
  }

  return <>{children}</>
}

