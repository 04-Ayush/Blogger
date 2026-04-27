'use client'

import DashboardSectionHeader from './DashboardSectionHeader'
import EmptyDashboardState from './EmptyDashboardState'

import { formatTimeAgo } from '../utils/formatters'
import type { RecentUser } from '../utils/types'

type Props = {
    title: string
    subtitle?: string | null
    users: RecentUser[]
}

export default function RecentUsersWidget({ title, subtitle, users }: Props) {
    const rows = users ?? []

    return (
        <section className="mt-6">
            <DashboardSectionHeader title={title} subtitle={subtitle ?? undefined} />

            {rows.length === 0 ? (
                <EmptyDashboardState
                    title="No users yet."
                    detail="New user signups will show up here."
                />
            ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <div className="space-y-3">
                        {rows.map((u) => (
                            <div
                                key={u.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white/80">
                                        {u.name}
                                        <span className="ml-2 text-xs text-white/40">({u.role})</span>
                                    </p>
                                    <p className="truncate text-xs text-white/50">
                                        {u.email}
                                    </p>
                                </div>

                                <p className="shrink-0 text-xs text-white/40">
                                    {formatTimeAgo(u.createdAt)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}
