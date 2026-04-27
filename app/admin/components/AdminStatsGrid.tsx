'use client'

import type { AdminStat } from '../utils/types'

import AdminStatCard from './AdminStatCard'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    stats: AdminStat[]
}

export default function AdminStatsGrid({ loading, stats }: Props) {
    return (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur"
                    >
                        <div className="h-4 w-28 rounded bg-white/10" />
                        <div className="mt-3 h-8 w-20 rounded bg-white/10" />
                        <div className="mt-3 h-4 w-40 rounded bg-white/10" />
                    </div>
                ))
            ) : stats.length === 0 ? (
                <EmptyState title="No stats available" detail="Counts will appear once the database is reachable." />
            ) : (
                stats.map((s) => <AdminStatCard key={s.label} stat={s} />)
            )}
        </section>
    )
}
