'use client'

import type { ModerationComment } from '../utils/types'
import { formatDateTime } from '../utils/formatters'

import AdminSectionHeader from './AdminSectionHeader'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    comments: ModerationComment[]
    onDelete: (id: string) => void
    deletingId: string | null
}

export default function CommentsModeration({ loading, comments, onDelete, deletingId }: Props) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="h-5 w-48 rounded bg-white/10" />
                <div className="mt-4 space-y-2">
                    <div className="h-20 rounded-2xl bg-white/5" />
                    <div className="h-20 rounded-2xl bg-white/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <AdminSectionHeader title="Comment Moderation" subtitle="Scan recent comments quickly" />

            {comments.length === 0 ? (
                <div className="mt-4">
                    <EmptyState title="No comments yet" detail="When readers comment, you’ll be able to moderate them here." />
                </div>
            ) : (
                <div className="mt-4 space-y-2">
                    {comments.map((c) => (
                        <div
                            key={c.id}
                            className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:bg-white/6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm text-white/80">
                                        <span className="font-semibold text-white">{c.user ?? '—'}</span>
                                        <span className="text-white/30"> on </span>
                                        <span className="font-medium text-white/85">{c.postTitle ?? '—'}</span>
                                    </div>
                                    <div className="mt-2 line-clamp-2 text-sm leading-6 text-white/65">“{c.text}”</div>
                                    <div className="mt-2 text-xs text-white/45">{formatDateTime(c.created_at)}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onDelete(c.id)}
                                    disabled={deletingId === c.id}
                                    className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletingId === c.id ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
