'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import CommentSection from '@/app/components/CommentSection'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { canEditPost, getCurrentUserRole, isAdmin } from '@/lib/auth/roles'

type PostDetail = {
    id: string
    title: string
    body: string | null
    summary: string | null
    image_url: string | null
    created_at: string | null
    author_id: string | null
}

function formatDate(value?: string | null) {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function PostDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const id = params?.id

    const supabase = useMemo(() => createClient(), [])
    const [post, setPost] = useState<PostDetail | null>(null)
    const [authorName, setAuthorName] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const deleteDialogCloseTimer = useRef<number | null>(null)
    const DELETE_DIALOG_ANIM_MS = 160
    const [role, setRole] = useState<Role>('viewer')
    const [roleLoaded, setRoleLoaded] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [bookmarked, setBookmarked] = useState(false)
    const [bookmarkBusy, setBookmarkBusy] = useState(false)

    useEffect(() => {
        let cancelled = false

        if (!id) {
            Promise.resolve().then(() => {
                if (cancelled) return
                setError('Missing post id.')
                setLoading(false)
            })
            return
        }

        ; (async () => {
            setLoading(true)
            setError(null)

            const current = await getCurrentUserRole()
            if (cancelled) return
            setRole(current.role)
            setRoleLoaded(true)
            setUserId(current.userId)

            const { data, error } = await supabase
                .from('posts')
                .select('id,title,body,summary,image_url,created_at,author_id')
                .eq('id', id)
                .single()

            if (cancelled) return

            if (error) {
                setError(error.message)
                setPost(null)
                setAuthorName(null)
                setLoading(false)
                return
            }

            const loadedPost: PostDetail = {
                id: String(data.id),
                title: data.title ?? '',
                body: data.body ?? null,
                summary: data.summary ?? null,
                image_url: data.image_url ?? null,
                created_at: data.created_at ?? null,
                author_id: data.author_id ?? null,
            }
            setPost(loadedPost)

            if (loadedPost.author_id) {
                const { data: author, error: authorError } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', loadedPost.author_id)
                    .single()

                if (!cancelled && !authorError) {
                    setAuthorName(author?.name ?? null)
                }
            } else {
                setAuthorName(null)
            }
            setLoading(false)
        })()

        return () => {
            cancelled = true
        }
    }, [id, supabase])

    useEffect(() => {
        let cancelled = false

            ; (async () => {
                if (!userId || !post?.id) {
                    setBookmarked(false)
                    return
                }

                const { data, error } = await supabase
                    .from('bookmarks')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('post_id', post.id)
                    .maybeSingle()

                if (cancelled) return

                if (error) {
                    setBookmarked(false)
                    return
                }

                setBookmarked(Boolean(data))
            })()

        return () => {
            cancelled = true
        }
    }, [post?.id, supabase, userId])

    const toggleBookmark = async () => {
        if (!post?.id) return
        if (!userId) {
            router.push('/login')
            return
        }
        if (bookmarkBusy) return

        const wasBookmarked = bookmarked
        setBookmarkBusy(true)
        setBookmarked(!wasBookmarked)

        try {
            if (wasBookmarked) {
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', userId)
                    .eq('post_id', post.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('bookmarks')
                    .insert([{ user_id: userId, post_id: post.id }])
                if (error) throw error
            }
        } catch {
            setBookmarked(wasBookmarked)
        } finally {
            setBookmarkBusy(false)
        }
    }

    const allowEdit = canEditPost(role, post?.author_id, userId)
    const canSeeSummary = roleLoaded && role !== 'author'

    const closeDeleteDialog = useCallback(() => {
        if (deleting) return
        setDeleteDialogVisible(false)
        if (deleteDialogCloseTimer.current) {
            window.clearTimeout(deleteDialogCloseTimer.current)
        }
        deleteDialogCloseTimer.current = window.setTimeout(() => {
            setDeleteDialogOpen(false)
        }, DELETE_DIALOG_ANIM_MS)
    }, [DELETE_DIALOG_ANIM_MS, deleting])

    useEffect(() => {
        return () => {
            if (deleteDialogCloseTimer.current) {
                window.clearTimeout(deleteDialogCloseTimer.current)
            }
        }
    }, [])

    const confirmDelete = async () => {
        if (!id || deleting) return

        setDeleting(true)
        setError(null)
        try {
            const current = await getCurrentUserRole()
            if (!current.userId) {
                setError('You must be logged in to delete a post.')
                return
            }

            let del = supabase.from('posts').delete().eq('id', String(id))
            if (!isAdmin(current.role)) {
                del = del.eq('author_id', current.userId)
            }

            const { error: deleteError } = await del
            if (deleteError) throw deleteError

            router.push('/posts')
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete post.'
            setError(message)
        } finally {
            setDeleting(false)
            closeDeleteDialog()
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1 px-4 py-6">
                    {deleteDialogOpen ? (
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Delete post confirmation"
                            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
                        >
                            <button
                                type="button"
                                aria-label="Close"
                                onClick={() => {
                                    closeDeleteDialog()
                                }}
                                className={[
                                    'absolute inset-0 bg-black/60 transition-opacity duration-150 ease-out',
                                    deleteDialogVisible ? 'opacity-100' : 'opacity-0',
                                    'motion-reduce:transition-none',
                                ].join(' ')}
                            />

                            <div
                                className={[
                                    'relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur',
                                    'transform-gpu transition-[transform,opacity] duration-150 ease-out will-change-transform',
                                    deleteDialogVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
                                    'motion-reduce:transition-none motion-reduce:transform-none',
                                ].join(' ')}
                            >
                                <h2 className="text-base font-semibold tracking-tight text-white">
                                    Delete this post?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-white/70">
                                    This action cannot be undone.
                                </p>

                                <div className="mt-5 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={() => closeDeleteDialog()}
                                        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={deleting}
                                        onClick={() => void confirmDelete()}
                                        className="inline-flex h-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {deleting ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">
                                {loading ? 'Loading…' : post?.title || 'Post'}
                            </h1>
                            <p className="mt-1 text-sm text-white/60">
                                {authorName ? (
                                    <span className="font-semibold text-emerald-400 text-base">
                                        By {authorName}
                                    </span>
                                ) : (
                                    <span />
                                )}
                                {authorName && post?.created_at ? <span className="text-white/30"> • </span> : null}
                                {post?.created_at ? <span>{formatDate(post.created_at)}</span> : null}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => router.push('/posts')}
                                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
                            >
                                Back
                            </button>

                            {allowEdit ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={!id || loading}
                                        onClick={() => {
                                            if (!id) return
                                            router.push(`/create-posts?postId=${encodeURIComponent(String(id))}`)
                                        }}
                                        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!id || loading || deleting}
                                        onClick={() => {
                                            if (!id || deleting) return
                                            setDeleteDialogOpen(true)
                                            setDeleteDialogVisible(false)
                                            if (deleteDialogCloseTimer.current) {
                                                window.clearTimeout(deleteDialogCloseTimer.current)
                                                deleteDialogCloseTimer.current = null
                                            }
                                            window.requestAnimationFrame(() => setDeleteDialogVisible(true))
                                        }}
                                        className="inline-flex h-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {deleting ? 'Deleting…' : 'Delete'}
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                            Loading post…
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">
                            {error}
                        </div>
                    ) : !post ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                            Post not found.
                        </div>
                    ) : (
                        <>
                            <article className="max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                                <div className="relative aspect-16/7 w-full bg-slate-950/40">
                                    <button
                                        type="button"
                                        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                                        aria-pressed={bookmarked}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            void toggleBookmark()
                                        }}
                                        disabled={bookmarkBusy}
                                        className={[
                                            'absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/55 text-white/80 backdrop-blur transition',
                                            'hover:bg-white/10',
                                            bookmarkBusy ? 'cursor-not-allowed opacity-60' : '',
                                        ].join(' ')}
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className={['h-5 w-5', bookmarked ? 'text-emerald-300' : 'text-white/75'].join(
                                                ' '
                                            )}
                                            fill={bookmarked ? 'currentColor' : 'none'}
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M7.5 4.6h9c.9 0 1.6.7 1.6 1.6v15.2l-6.1-3.7-6.1 3.7V6.2c0-.9.7-1.6 1.6-1.6Z"
                                                stroke="currentColor"
                                                strokeWidth="1.6"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                    {post.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={post.image_url}
                                            alt={post.title || 'Post image'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                                            No image
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                                </div>

                                <div className="p-6 sm:p-8">
                                    <h2 className="text-xl font-semibold tracking-tight text-white">
                                        {post.title || 'Untitled'}
                                    </h2>

                                    {canSeeSummary && post.summary ? (
                                        <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-4">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                                                AI Summary
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-white/75">
                                                {post.summary}
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/75">
                                        {post.body || 'No content.'}
                                    </div>
                                </div>
                            </article>

                            <CommentSection
                                postId={post.id}
                                postAuthorId={post.author_id}
                                currentUserId={userId}
                                role={role}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
