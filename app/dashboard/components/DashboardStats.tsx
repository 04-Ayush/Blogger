'use client'

import { formatCompactNumber } from '../utils/formatters'
import type { DashboardStat } from '../utils/types'

type Props = {
    stats: DashboardStat[]
}

export default function DashboardStats({ stats }: Props) {
    if (!stats || stats.length === 0) return null

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur"
                >
                    <p className="text-xs font-medium text-white/60">
                        {s.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {formatCompactNumber(s.value)}
                    </p>
                    {s.hint ? (
                        <p className="mt-1 text-xs text-white/40">
                            {s.hint}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
