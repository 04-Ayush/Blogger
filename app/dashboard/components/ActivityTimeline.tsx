'use client'

import DashboardSectionHeader from './DashboardSectionHeader'
import EmptyDashboardState from './EmptyDashboardState'

import { formatTimeAgo } from '../utils/formatters'
import type { ActivityItem } from '../utils/types'

type Props = {
    activity: ActivityItem[]
}

export default function ActivityTimeline({ activity }: Props) {
    const rows = activity ?? []

    return (
        <section className="mt-6">
            <DashboardSectionHeader title="Activity" subtitle="Latest updates across your workspace." />

            {rows.length === 0 ? (
                <EmptyDashboardState
                    title="No activity yet."
                    detail="When something happens, it will show up here."
                />
            ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <div className="space-y-3">
                        {rows.map((a) => (
                            <div
                                key={a.id}
                                className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white/80">
                                        {a.title}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm text-white/60">
                                        {a.detail}
                                    </p>
                                </div>
                                <p className="shrink-0 text-xs text-white/40">
                                    {formatTimeAgo(a.at)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
