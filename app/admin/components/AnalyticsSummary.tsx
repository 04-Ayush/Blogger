'use client'

import AdminSectionHeader from './AdminSectionHeader'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    roleDistribution: { viewers: number; authors: number; admins: number } | null
}

export default function AnalyticsSummary({ loading, roleDistribution }: Props) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <AdminSectionHeader title="Analytics Summary" subtitle="Role distribution & platform health" />

            {loading ? (
                <div className="mt-5 space-y-4">
                    <div className="h-10 rounded-xl bg-white/5" />
                    <div className="h-10 rounded-xl bg-white/5" />
                    <div className="h-10 rounded-xl bg-white/5" />
                </div>
            ) : !roleDistribution ? (
                <div className="mt-4">
                    <EmptyState title="No analytics yet" detail="Role distribution will appear once users exist." />
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {(
                        [
                            { label: 'Viewers', value: roleDistribution.viewers, bar: 'bg-white/25' },
                            { label: 'Authors', value: roleDistribution.authors, bar: 'bg-cyan-500/30' },
                            { label: 'Admins', value: roleDistribution.admins, bar: 'bg-emerald-500/35' },
                        ] as const
                    ).map((m) => (
                        <div key={m.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-white/70">{m.label}</div>
                                <div className="text-white/60">{m.value}%</div>
                            </div>
                            <div className="h-2 rounded-full border border-white/10 bg-slate-950/30">
                                <div className={['h-full rounded-full', m.bar].join(' ')} style={{ width: `${m.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
