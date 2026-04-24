'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { canCreatePosts, getCurrentUserRole } from '@/lib/auth/roles'

type PostListItem = {
  id: string
  title: string
  body: string | null
  image_url: string | null
  created_at: string | null
}

function preview(text: string | null, max = 160) {
  const value = (text ?? '').trim()
  if (!value) return ''
  if (value.length <= max) return value
  return value.slice(0, max).trimEnd() + '…'
}

export default function PostsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<Role>('viewer')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const current = await getCurrentUserRole()
      if (cancelled) return
      setRole(current.role)

      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('posts')
        .select('id,title,body,image_url,created_at')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        setError(error.message)
        setPosts([])
        setLoading(false)
        return
      }

      setPosts(
        (data ?? []).map((p) => ({
          id: String(p.id),
          title: p.title ?? '',
          body: p.body ?? null,
          image_url: p.image_url ?? null,
          created_at: p.created_at ?? null,
        }))
      )
      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              No posts available.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${encodeURIComponent(post.id)}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur transition hover:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950/40">
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
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="truncate text-base font-semibold tracking-tight text-white">
                      {post.title || 'Untitled'}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
                      {preview(post.body) || 'No preview available.'}
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
