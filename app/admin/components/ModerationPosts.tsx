'use client'

import Link from 'next/link'

import type { ModerationPost } from '../utils/types'
import { formatDate } from '../utils/formatters'

import AdminSectionHeader from './AdminSectionHeader'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    posts: ModerationPost[]
    onDelete: (id: string) => void
    deletingId: string | null
}

export default function ModerationPosts({ loading, posts, onDelete, deletingId }: Props) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="h-5 w-44 rounded bg-white/10" />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="h-28 rounded-2xl bg-white/5" />
                    <div className="h-28 rounded-2xl bg-white/5" />
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <AdminSectionHeader title="Posts Moderation" subtitle="Review recent posts and take quick actions" />

            {posts.length === 0 ? (
                <div className="mt-4">
                    <EmptyState title="No posts to moderate" detail="New posts will show up here for review and actions." />
                </div>
            ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {posts.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:bg-white/6"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-white">{p.title}</div>
                                    <div className="mt-1 text-sm text-white/60">
                                        <span className="text-white/45">by</span> {p.author}
                                        <span className="text-white/25"> · </span>
                                        <span className="text-white/50">{formatDate(p.created_at)}</span>
                                    </div>
                                </div>
                                {p.status ? (
                                    <span className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70">
                                        {p.status}
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">
                                {p.summary?.trim() ? p.summary : '—'}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                                <Link
                                    href={`/posts/${encodeURIComponent(p.id)}`}
                                    className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 transition hover:bg-white/10"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/create-posts?postId=${encodeURIComponent(p.id)}`}
                                    className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-transparent px-3 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                                >
                                    Edit
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => onDelete(p.id)}
                                    disabled={deletingId === p.id}
                                    className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {deletingId === p.id ? 'Deleting…' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
