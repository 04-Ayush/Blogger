'use client'

type Props = {
    title?: string
    detail?: string
}

export default function EmptyDashboardState({
    title = 'Nothing here yet',
    detail = 'When data is available, it will show up here.',
}: Props) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <p className="font-medium text-white/80">
                {title}
            </p>
            <p className="mt-1 text-white/60">
                {detail}
            </p>
        </div>
    )
}
