'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { postSchema } from '@/lib/validations/post'
import type { Role } from '@/lib/auth/roles'
import { canCreatePosts, getCurrentUserRole, isAdmin } from '@/lib/auth/roles'

type FormState = {
  title: string
  image_url: string
  body: string
}

const initialState: FormState = {
  title: '',
  image_url: '',
  body: '',
}

const SUMMARY_CACHE_KEY = 'gemini_summary_cache_v1'

type SummaryCache = Record<string, { summary: string; createdAt: number }>

async function sha256(text: string) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readCache(): SummaryCache {
  try {
    const raw = localStorage.getItem(SUMMARY_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as SummaryCache
  } catch {
    return {}
  }
}

function writeCache(cache: SummaryCache) {
  // Keep the cache small (avoid unbounded localStorage growth).
  const entries = Object.entries(cache).sort((a, b) => b[1].createdAt - a[1].createdAt).slice(0, 20)
  const next = Object.fromEntries(entries) as SummaryCache
  try {
    localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

async function generateSummary(bodyText: string) {
  const res = await fetch('/api/generate-summary', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ bodyText }),
  })

  const json = (await res.json().catch(() => null)) as null | { summary?: string; error?: string }

  if (!res.ok) {
    throw new Error(json?.error || 'Failed to generate summary.')
  }

  const summary = String(json?.summary ?? '').trim()
  if (!summary) throw new Error('Generated summary was empty.')
  return summary
}

async function getOrGenerateSummary(bodyText: string) {
  const text = bodyText.trim()
  const key = await sha256(text)

  const cache = readCache()
  const cached = cache[key]?.summary?.trim()
  if (cached) return cached

  const summary = await generateSummary(text)
  cache[key] = { summary, createdAt: Date.now() }
  writeCache(cache)
  return summary
}

export default function CreatePostsClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('postId')
  const supabase = useMemo(() => createClient(), [])

  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [role, setRole] = useState<Role>('viewer')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const current = await getCurrentUserRole()
      if (cancelled) return

      setRole(current.role)
      setUserId(current.userId)

      if (!current.userId) {
        router.push('/login')
        return
      }

      // Only authors can create new posts; admins can only edit existing posts.
      if (!postId) {
        if (!canCreatePosts(current.role)) {
          router.push('/posts')
          return
        }
      } else {
        if (current.role === 'viewer') {
          router.push('/posts')
          return
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [postId, router])

  useEffect(() => {
    let cancelled = false

    if (!postId) return

    ;(async () => {
      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const current = await getCurrentUserRole()
        if (!current.userId) {
          setError('You must be logged in to edit a post.')
          router.push('/login')
          return
        }

        if (current.role === 'viewer') {
          setError('You do not have permission to edit posts.')
          router.push('/posts')
          return
        }

        let q = supabase.from('posts').select('id,title,image_url,body').eq('id', postId)

        if (!isAdmin(current.role)) {
          q = q.eq('author_id', current.userId)
        }

        const { data, error: loadError } = await q.single()

        if (loadError) throw loadError
        if (cancelled) return

        setForm({
          title: data?.title ?? '',
          image_url: data?.image_url ?? '',
          body: data?.body ?? '',
        })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Failed to load post for editing.'
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [postId, router, supabase])

  const onChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setError(null)
    setSuccess(null)

    const parsed = postSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form data')
      return
    }

    setLoading(true)
    try {
      const current = await getCurrentUserRole()
      if (!current.userId) {
        setError('You must be logged in to create a post.')
        router.push('/login')
        return
      }

      if (!canCreatePosts(current.role)) {
        // Admin is allowed to update, but not allowed to create.
        if (!postId) {
          setError('You do not have permission to create posts.')
          router.push('/posts')
          return
        }
      }

      if (postId) {
        let upd = supabase
          .from('posts')
          .update({
            title: parsed.data.title,
            body: parsed.data.body,
            image_url: parsed.data.image_url,
          })
          .eq('id', postId)

        if (!isAdmin(current.role)) {
          upd = upd.eq('author_id', current.userId)
        }

        const { error: updateError } = await upd
        if (updateError) throw updateError
      } else {
        // Generate once on creation and store to DB (never regenerate on refresh).
        const summary = await getOrGenerateSummary(parsed.data.body)

        const { error: insertError } = await supabase.from('posts').insert({
          title: parsed.data.title,
          body: parsed.data.body,
          image_url: parsed.data.image_url,
          author_id: current.userId,
          summary,
        })

        if (insertError) throw insertError
      }

      setSuccess(postId ? 'Post updated successfully. Redirecting…' : 'Post created successfully. Redirecting…')
      setForm(initialState)
      window.setTimeout(() => router.push('/posts'), 700)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong creating the post.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{postId ? 'Edit Post' : 'Create Post'}</h1>
            <p className="mt-1 text-sm text-white/70">{postId ? 'Update your post details.' : 'Write something worth reading.'}</p>
          </div>

          <div className="max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Title</label>
                <input
                  value={form.title}
                  onChange={onChange('title')}
                  placeholder="A clear, compelling headline"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Featured Image URL</label>
                <input
                  value={form.image_url}
                  onChange={onChange('image_url')}
                  placeholder="https://…"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/90">Body Content</label>
                <textarea
                  value={form.body}
                  onChange={onChange('body')}
                  rows={10}
                  placeholder="Start writing…"
                  className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20 focus:ring-2 focus:ring-white/10"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  {success}
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition',
                    loading ? 'cursor-not-allowed bg-white/10 text-white/60' : 'bg-white text-slate-950 hover:bg-white/90',
                  ].join(' ')}
                >
                  {loading ? (postId ? 'Saving…' : 'Creating…') : postId ? 'Save Changes' : 'Create Post'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => router.push('/posts')}
                  className="rounded-xl border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

