'use client'

import { useEffect, useMemo, useState } from 'react'
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
    const [role, setRole] = useState<Role>('viewer')
    const [userId, setUserId] = useState<string | null>(null)

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
            setUserId(current.userId)

            const { data, error } = await supabase
                .from('posts')
                .select('id,title,body,image_url,created_at,author_id')
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

    const allowEdit = canEditPost(role, post?.author_id, userId)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1 px-4 py-6">
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
                                        onClick={async () => {
                                            if (!id || deleting) return
                                            const ok = window.confirm('Delete this post? This action cannot be undone.')
                                            if (!ok) return

                                            setDeleting(true)
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
                                                const message =
                                                    err instanceof Error ? err.message : 'Failed to delete post.'
                                                setError(message)
                                            } finally {
                                                setDeleting(false)
                                            }
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
                                <div className="relative aspect-[16/7] w-full bg-slate-950/40">
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
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                                </div>

                                <div className="p-6 sm:p-8">
                                    <h2 className="text-xl font-semibold tracking-tight text-white">
                                        {post.title || 'Untitled'}
                                    </h2>
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
