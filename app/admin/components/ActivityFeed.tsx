'use client'

import type { ActivityItem } from '../utils/types'
import { toneDot } from '../utils/adminHelpers'
import { formatDateTime } from '../utils/formatters'

import AdminSectionHeader from './AdminSectionHeader'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    items: ActivityItem[]
}

export default function ActivityFeed({ loading, items }: Props) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="h-5 w-40 rounded bg-white/10" />
                <div className="mt-4 space-y-3">
                    <div className="h-12 rounded-xl bg-white/5" />
                    <div className="h-12 rounded-xl bg-white/5" />
                    <div className="h-12 rounded-xl bg-white/5" />
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return <EmptyState title="No recent activity" detail="Platform events will appear here as they happen." />
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <AdminSectionHeader title="Recent Activity" subtitle="Latest platform events" />

            <div className="mt-5 space-y-4">
                {items.map((item, idx) => (
                    <div key={item.id} className="relative pl-6">
                        <div className={['absolute left-1.5 top-2 h-2.5 w-2.5 rounded-full', toneDot(item.tone)].join(' ')} />
                        {idx !== items.length - 1 ? (
                            <div className="absolute left-2 top-6 h-[calc(100%-1.1rem)] w-px bg-white/10" />
                        ) : null}
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-white">{item.title}</div>
                                <div className="mt-1 text-sm text-white/60">{item.detail}</div>
                            </div>
                            <div className="shrink-0 text-xs text-white/45">{formatDateTime(item.at)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
