'use client'

import type { AdminStat } from '../utils/types'
import { formatCompactNumber } from '../utils/formatters'

type Props = {
    stat: AdminStat
}

function Icon({ name }: { name: AdminStat['icon'] }) {
    const cls = 'h-5 w-5'
    switch (name) {
        case 'posts':
            return (
                <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
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
        case 'users':
            return (
                <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
                    <path
                        d="M16.6 20.2c-.7-2.6-2.9-4.4-5.6-4.4s-4.9 1.8-5.6 4.4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M11 12.9a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                    />
                    <path
                        d="M18.8 10.3a3.2 3.2 0 1 0-3.4-5.1"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M20.6 20.2c-.3-1.2-1-2.3-2-3.1"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            )
        case 'authors':
            return (
                <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
                    <path
                        d="M14.8 4.5H7.6c-1 0-1.8.8-1.8 1.8v12.9c0 1 .8 1.8 1.8 1.8h8.8c1 0 1.8-.8 1.8-1.8V9.2l-3.4-4.7Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M14.8 4.5v4c0 .9.7 1.6 1.6 1.6h2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                    <path
                        d="M9 13.1h6M9 16.6h4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            )
        case 'comments':
            return (
                <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
                    <path
                        d="M7.2 18.6 4 20.4l.7-3.6a8.2 8.2 0 1 1 2.5 1.8Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8.4 10.6h7.2M8.4 13.8h5.3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            )
    }
}

export default function AdminStatCard({ stat }: Props) {
    const trendTone =
        stat.trend.direction === 'up'
            ? 'text-emerald-300'
            : stat.trend.direction === 'down'
                ? 'text-rose-200'
                : 'text-white/60'

    return (
        <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/7">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-medium text-white/70">{stat.label}</div>
                    <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{formatCompactNumber(stat.value)}</div>
                    <div className={['mt-2 inline-flex items-center gap-2 text-xs font-medium', trendTone].join(' ')}>
                        <span
                            className={[
                                'inline-flex h-5 items-center justify-center rounded-full border px-2',
                                stat.trend.direction === 'up'
                                    ? 'border-emerald-500/20 bg-emerald-500/10'
                                    : stat.trend.direction === 'down'
                                        ? 'border-rose-500/20 bg-rose-500/10'
                                        : 'border-white/10 bg-white/5',
                            ].join(' ')}
                        >
                            {stat.trend.value}
                        </span>
                        <span className="text-white/45">vs last 30 days</span>
                    </div>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 transition group-hover:bg-emerald-500/15">
                    <Icon name={stat.icon} />
                </div>
            </div>
        </div>
    )
}
