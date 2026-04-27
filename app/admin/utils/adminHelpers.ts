import type { AdminUserRow, ActivityItem, Trend } from './types'

export function toneDot(tone: ActivityItem['tone']) {
    if (tone === 'success') return 'bg-emerald-400'
    if (tone === 'warning') return 'bg-amber-400'
    if (tone === 'danger') return 'bg-rose-400'
    return 'bg-white/35'
}

export function roleBadge(role: AdminUserRow['role']) {
    if (role === 'admin') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
    if (role === 'author') return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
    return 'border-white/10 bg-white/5 text-white/70'
}

export function safeRole(value: unknown): AdminUserRow['role'] {
    if (value === 'admin' || value === 'author' || value === 'viewer') return value
    return 'viewer'
}

export function computeTrend(current: number | null, previous: number | null): Trend {
    if (current == null || previous == null || previous === 0) {
        if (current == null || previous == null) return { value: '—', direction: 'flat' }
        if (previous === 0) return { value: current === 0 ? '0%' : '+100%', direction: current === 0 ? 'flat' : 'up' }
    }

    const delta = (current ?? 0) - (previous ?? 0)
    const pct = previous ? Math.round((delta / previous) * 100) : 0
    const direction: Trend['direction'] = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
    const sign = pct > 0 ? '+' : ''
    return { value: `${sign}${pct}%`, direction }
}
