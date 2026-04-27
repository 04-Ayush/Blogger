'use client'

type Props = {
    title: string
    detail: string
}

export default function EmptyState({ title, detail }: Props) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <div className="text-white/90 font-medium">{title}</div>
            <div className="mt-1 text-white/55">{detail}</div>
        </div>
    )
}
