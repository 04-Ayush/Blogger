export function formatCompactNumber(value: number): string {
    try {
        return new Intl.NumberFormat(undefined, {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value)
    } catch {
        return String(value)
    }
}

export function formatDate(value?: string | null): string {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatTimeAgo(value?: string | null): string {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '—'

    const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
    if (seconds < 10) return 'just now'
    if (seconds < 60) return `${seconds}s ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
}
