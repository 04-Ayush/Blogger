'use client'

import Link from 'next/link'

import DashboardSectionHeader from './DashboardSectionHeader'
import EmptyDashboardState from './EmptyDashboardState'

import { formatTimeAgo } from '../utils/formatters'
import type { RecentComment } from '../utils/types'

type Props = {
    title: string
    subtitle?: string | null
    comments: RecentComment[]
    emptyTitle?: string
    emptyDetail?: string
}

export default function RecentCommentsWidget({
    title,
    subtitle,
    comments,
    emptyTitle,
    emptyDetail,
}: Props) {
    const rows = comments ?? []

    return (
        <section className="mt-6">
            <DashboardSectionHeader title={title} subtitle={subtitle ?? undefined} />

            {rows.length === 0 ? (
                <EmptyDashboardState
                    title={emptyTitle ?? 'No comments yet.'}
                    detail={emptyDetail ?? 'When comments come in, they will appear here.'}
                />
            ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <div className="space-y-4">
                        {rows.map((c) => {
                            const href = c.postId ? `/posts/${c.postId}` : '/posts'
                            return (
                                <Link
                                    key={c.id}
                                    href={href}
                                    className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-white/5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-white/80">
                                                {c.postTitle ?? 'Post'}
                                            </p>
                                            <p className="mt-1 line-clamp-2 text-sm text-white/60">
                                                {c.text || '—'}
                                            </p>
                                            <p className="mt-2 text-xs text-white/40">
                                                {c.userName ? `${c.userName} • ` : ''}{formatTimeAgo(c.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    )
}
