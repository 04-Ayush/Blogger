'use client'

import type { ReactNode } from 'react'

type Props = {
    title: string
    subtitle?: string
    right?: ReactNode
}

export default function AdminSectionHeader({ title, subtitle, right }: Props) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
        </div>
    )
}
