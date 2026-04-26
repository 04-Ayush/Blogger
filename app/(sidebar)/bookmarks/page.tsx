'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import { createClient } from '@/lib/supabase/client'

type BookmarkedPost = {
    id: string
    title: string
    body: string | null
    summary: string | null
    image_url: string | null
    created_at: string | null
}

function preview(text: string | null, max = 160) {
    const value = (text ?? '').trim()
    if (!value) return ''
    if (value.length <= max) return value
    return value.slice(0, max).trimEnd() + '…'
}

export default function BookmarksPage() {
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])

    const [userId, setUserId] = useState<string | null>(null)
    const [posts, setPosts] = useState<BookmarkedPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

            ; (async () => {
                setLoading(true)
                setError(null)

                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser()

                if (cancelled) return

                if (userError || !user) {
                    setUserId(null)
                    setPosts([])
                    setLoading(false)
                    return
                }

                setUserId(user.id)

                // Prefer FK join: bookmarks -> posts
                const joined = await supabase
                    .from('bookmarks')
                    .select('post_id,created_at,posts(id,title,body,summary,image_url,created_at)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (cancelled) return

                if (!joined.error) {
                    const mapped: BookmarkedPost[] = (joined.data ?? [])
                        .map((row) => {
                            const post = (row as any).posts
                            if (!post) return null
                            return {
                                id: String(post.id),
                                title: String(post.title ?? ''),
                                body: post.body ?? null,
                                summary: post.summary ?? null,
                                image_url: post.image_url ?? null,
                                created_at: post.created_at ?? null,
                            }
                        })
                        .filter(Boolean) as BookmarkedPost[]

                    setPosts(mapped)
                    setLoading(false)
                    return
                }

                // Fallback if relationship isn't configured.
                const plain = await supabase
                    .from('bookmarks')
                    .select('post_id,created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (cancelled) return

                if (plain.error) {
                    setError(plain.error.message)
                    setPosts([])
                    setLoading(false)
                    return
                }

                const postIds = Array.from(
                    new Set((plain.data ?? []).map((r: any) => String(r.post_id)).filter(Boolean))
                )

                if (postIds.length === 0) {
                    setPosts([])
                    setLoading(false)
                    return
                }

                const { data: postRows, error: postError } = await supabase
                    .from('posts')
                    .select('id,title,body,summary,image_url,created_at')
                    .in('id', postIds)

                if (cancelled) return

                if (postError) {
                    setError(postError.message)
                    setPosts([])
                    setLoading(false)
                    return
                }

                const byId = new Map((postRows ?? []).map((p: any) => [String(p.id), p]))
                const ordered: BookmarkedPost[] = postIds
                    .map((id) => byId.get(id))
                    .filter(Boolean)
                    .map((p: any) => ({
                        id: String(p.id),
                        title: String(p.title ?? ''),
                        body: p.body ?? null,
                        summary: p.summary ?? null,
                        image_url: p.image_url ?? null,
                        created_at: p.created_at ?? null,
                    }))

                setPosts(ordered)
                setLoading(false)
            })()

        return () => {
            cancelled = true
        }
    }, [supabase])

    const unbookmark = async (postId: string) => {
        if (!userId) {
            router.push('/login')
            return
        }
        if (busyId) return

        setBusyId(postId)
        try {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', userId)
                .eq('post_id', postId)

            if (error) throw error
            setPosts((prev) => prev.filter((p) => p.id !== postId))
        } catch (e) {
            // keep UI stable; error banner for visibility
            setError(e instanceof Error ? e.message : 'Failed to remove bookmark.')
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1 px-4 py-6">
                    <div className="mb-6 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Bookmarks</h1>
                            <p className="mt-1 text-sm text-white/70">Your saved posts.</p>
                        </div>
                    </div>

                    {error ? (
                        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                            {error}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                            Loading bookmarks…
                        </div>
                    ) : !userId ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                            Please sign in to view your bookmarks.
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                            No bookmarks yet.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/posts/${encodeURIComponent(post.id)}`}
                                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur transition hover:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                                >
                                    <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-950/40">
                                        <button
                                            type="button"
                                            aria-label="Remove bookmark"
                                            aria-pressed={true}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                void unbookmark(post.id)
                                            }}
                                            disabled={busyId === post.id}
                                            className={[
                                                'absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/55 text-white/80 backdrop-blur transition',
                                                'hover:bg-white/10',
                                                busyId === post.id ? 'cursor-not-allowed opacity-60' : '',
                                            ].join(' ')}
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5 text-emerald-300"
                                                fill="currentColor"
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
                                                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
                                                No image
                                            </div>
                                        )}
                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                                    </div>

                                    <div className="p-5">
                                        <h3 className="truncate text-base font-semibold tracking-tight text-white">
                                            {post.title || 'Untitled'}
                                        </h3>
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                                            {preview(post.summary ?? post.body) || 'No preview available.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
