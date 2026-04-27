'use client'

import type { Role } from '@/lib/auth/roles'

import { getDashboardTitle, getGreetingByTime, getRoleAccent } from '../utils/dashboardHelpers'

type Props = {
    role: Role
}

export default function DashboardHeader({ role }: Props) {
    const accent = getRoleAccent(role)

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        {getDashboardTitle(role)}
                    </h1>
                    <p className="mt-1 text-sm text-white/70">
                        {getGreetingByTime()} — your role is{' '}
                        <span className={[
                            'inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                            accent.badge,
                        ].join(' ')}>
                            <span className={['h-1.5 w-1.5 rounded-full', accent.dot].join(' ')} />
                            {role}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}
