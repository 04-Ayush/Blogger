'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { canCreatePosts, getCurrentUserRole } from '@/lib/auth/roles'

type PostListItem = {
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

export default function PostsClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = (searchParams.get('q') ?? '').trim().toLowerCase()
  const pageParam = searchParams.get('page')
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1)
  const supabase = useMemo(() => createClient(), [])
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [role, setRole] = useState<Role>('viewer')
  const [roleLoaded, setRoleLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [bookmarkedById, setBookmarkedById] = useState<Record<string, boolean>>({})
  const [bookmarkBusyId, setBookmarkBusyId] = useState<string | null>(null)

  const PAGE_SIZE = 6

  const setPage = (nextPage: number) => {
    const safe = Math.max(1, nextPage)
    const params = new URLSearchParams(searchParams.toString())
    if (safe <= 1) params.delete('page')
    else params.set('page', String(safe))

    const qs = params.toString()
    router.push(qs ? `/posts?${qs}` : '/posts')
  }

  useEffect(() => {
    let cancelled = false

      ; (async () => {
        const current = await getCurrentUserRole()
        if (cancelled) return
        setRole(current.role)
        setRoleLoaded(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (cancelled) return
        setUserId(user?.id ?? null)
      })()

    return () => {
      cancelled = true
    }
  }, [supabase])

  useEffect(() => {
    let cancelled = false

      ; (async () => {
        setLoading(true)
        setError(null)

        const from = (page - 1) * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase
          .from('posts')
          .select('id,title,body,summary,image_url,created_at', { count: 'exact' })
          .order('created_at', { ascending: false })

        if (q) {
          const pattern = `%${q}%`
          query = query.or(`title.ilike.${pattern},summary.ilike.${pattern},body.ilike.${pattern}`)
        }

        const { data, error, count } = await query.range(from, to)

        if (cancelled) return

        if (error) {
          setError(error.message)
          setPosts([])
          setTotalCount(0)
          setLoading(false)
          return
        }

        const mapped = (data ?? []).map((p: any) => ({
          id: String(p.id),
          title: p.title ?? '',
          body: p.body ?? null,
          summary: p.summary ?? null,
          image_url: p.image_url ?? null,
          created_at: p.created_at ?? null,
        }))

        setPosts(mapped)
        setTotalCount(count ?? 0)
        setLoading(false)
      })()

    return () => {
      cancelled = true
    }
  }, [supabase, q, page])

  useEffect(() => {
    if (page <= 1) return
    // If the query changes (search), reset back to page 1.
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  useEffect(() => {
    let cancelled = false

      ; (async () => {
        if (!userId) {
          setBookmarkedById({})
          return
        }

        const ids = posts.map((p) => p.id)
        if (ids.length === 0) {
          setBookmarkedById({})
          return
        }

        const { data, error } = await supabase
          .from('bookmarks')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', ids)

        if (cancelled) return
        if (error) {
          setBookmarkedById({})
          return
        }

        const next: Record<string, boolean> = {}
          ; (data ?? []).forEach((row: any) => {
            const postId = String(row.post_id)
            if (postId) next[postId] = true
          })
        setBookmarkedById(next)
      })()

    return () => {
      cancelled = true
    }
  }, [posts, supabase, userId])

  const toggleBookmark = async (postId: string) => {
    if (!postId) return
    if (!userId) {
      router.push('/login')
      return
    }
    if (bookmarkBusyId) return

    const isBookmarked = Boolean(bookmarkedById[postId])
    setBookmarkBusyId(postId)
    setBookmarkedById((prev) => ({ ...prev, [postId]: !isBookmarked }))

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert([{ user_id: userId, post_id: postId }])
        if (error) throw error
      }
    } catch {
      setBookmarkedById((prev) => ({ ...prev, [postId]: isBookmarked }))
    } finally {
      setBookmarkBusyId(null)
    }
  }

  const canSeeSummary = roleLoaded && role !== 'author'
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">Posts</h1>
              <p className="mt-1 text-sm text-white/70">Browse all posts.</p>
            </div>

            {canCreatePosts(role) ? (
              <button
                type="button"
                onClick={() => router.push('/create-posts')}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Create Post
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Loading posts…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">
              {error}
            </div>
          ) : totalCount === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              No posts available.
            </div>
          ) : (
            <>
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
                        aria-label={bookmarkedById[post.id] ? 'Remove bookmark' : 'Add bookmark'}
                        aria-pressed={Boolean(bookmarkedById[post.id])}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          void toggleBookmark(post.id)
                        }}
                        disabled={bookmarkBusyId === post.id}
                        className={[
                          'absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-950/55 text-white/80 backdrop-blur transition',
                          'hover:bg-white/10',
                          bookmarkBusyId === post.id ? 'cursor-not-allowed opacity-60' : '',
                        ].join(' ')}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className={['h-5 w-5', bookmarkedById[post.id] ? 'text-emerald-300' : 'text-white/75'].join(' ')}
                          fill={bookmarkedById[post.id] ? 'currentColor' : 'none'}
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
                        <div className="flex h-full w-full items-center justify-center text-xs text-white/40">No image</div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent" />
                    </div>

                    <div className="p-5">
                      <h3 className="truncate text-base font-semibold tracking-tight text-white">{post.title || 'Untitled'}</h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                        {preview(canSeeSummary ? (post.summary ?? post.body) : post.body) || 'No preview available.'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {posts.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                  No posts on this page.
                </div>
              ) : null}

              {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm text-white/70">
                    Page <span className="font-medium text-white/90">{page}</span> of{' '}
                    <span className="font-medium text-white/90">{totalPages}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(page - 1)}
                      disabled={!canGoPrev}
                      className={[
                        'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        !canGoPrev ? 'cursor-not-allowed opacity-60' : '',
                      ].join(' ')}
                    >
                      Prev
                    </button>

                    <button
                      type="button"
                      onClick={() => setPage(page + 1)}
                      disabled={!canGoNext}
                      className={[
                        'inline-flex h-9 items-center justify-center rounded-xl border px-3 text-sm font-medium transition',
                        'border-white/10 bg-white/5 text-white/80 hover:bg-white/10',
                        !canGoNext ? 'cursor-not-allowed opacity-60' : '',
                      ].join(' ')}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
