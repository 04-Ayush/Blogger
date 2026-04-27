'use client'

import DashboardSectionHeader from './DashboardSectionHeader'

import type { DashboardAnalytics } from '../utils/types'

type Props = {
    analytics: DashboardAnalytics | null
}

export default function AnalyticsCard({ analytics }: Props) {
    if (!analytics) return null

    return (
        <section className="mt-6">
            <DashboardSectionHeader
                title="Analytics"
                subtitle="A quick snapshot of recent engagement."
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-medium text-white/60">
                            {analytics.primaryMetricLabel}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                            {analytics.primaryMetricValue}
                        </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-xs text-white/50">Level</p>
                        <p className="mt-1 text-sm font-medium text-white/80">
                            {analytics.engagementLabel}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
