'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Role } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/client'
import { canComment, canDeleteComment, canViewComments } from '@/lib/auth/comment-permissions'

type CommentRow = {
  id: string
  post_id: string
  user_id: string
  comment_text: string
  created_at: string | null
  userName: string | null
}

type CommentSelectRow = {
  id: string | number
  post_id: string | number
  user_id: string | number
  comment_text: string | null
  created_at: string | null
  users?: { name?: string | null } | null
}

type UserSelectRow = {
  id: string | number
  name: string | null
}

type Props = {
  postId: string
  postAuthorId: string | null
  currentUserId: string | null
  role: Role
}

function formatDateTime(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CommentSection({ postId, postAuthorId, currentUserId, role }: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')

  const allowView = canViewComments(role, postAuthorId, currentUserId)
  const allowCreate = canComment(role)
  const allowDelete = canDeleteComment(role)

  const load = useCallback(async () => {
    if (!allowView) {
      setComments([])
      return
    }

    setLoading(true)
    setError(null)
    const baseQuery = supabase
      .from('comments')
      .select('id,post_id,user_id,comment_text,created_at,users(name)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    const joined = await baseQuery

    // If the schema doesn't have a relationship for `comments -> users`,
    // fall back to a second query to resolve names by user_id.
    if (joined.error) {
      const { data: plain, error: plainError } = await supabase
        .from('comments')
        .select('id,post_id,user_id,comment_text,created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (plainError) {
        setError(plainError.message)
        setComments([])
        setLoading(false)
        return
      }

      const plainRows = (plain ?? []) as unknown as Omit<CommentSelectRow, 'users'>[]
      const userIds = Array.from(new Set(plainRows.map((r) => String(r.user_id)).filter(Boolean)))

      let nameById = new Map<string, string | null>()
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id,name')
          .in('id', userIds)

        if (!usersError) {
          const userRows = (users ?? []) as unknown as UserSelectRow[]
          nameById = new Map(userRows.map((u) => [String(u.id), u.name ?? null]))
        }
      }

      const mapped: CommentRow[] = plainRows.map((row) => ({
        id: String(row.id),
        post_id: String(row.post_id),
        user_id: String(row.user_id),
        comment_text: String(row.comment_text ?? ''),
        created_at: row.created_at ?? null,
        userName: nameById.get(String(row.user_id)) ?? null,
      }))

      setComments(mapped)
      setLoading(false)
      return
    }

    const rows = (joined.data ?? []) as unknown as CommentSelectRow[]
    const mapped: CommentRow[] = rows.map((row) => ({
      id: String(row.id),
      post_id: String(row.post_id),
      user_id: String(row.user_id),
      comment_text: String(row.comment_text ?? ''),
      created_at: row.created_at ?? null,
      userName: row.users?.name ?? null,
    }))

    setComments(mapped)
    setLoading(false)
  }, [allowView, postId, supabase])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(t)
  }, [load])

  return (
    <section className="mt-6 max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4 sm:px-8">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-white">Comments</h3>
          <p className="mt-0.5 text-xs text-white/50">
            {allowView ? `${comments.length} total` : 'Only the post author can view comments.'}
          </p>
        </div>
      </div>

      {allowCreate ? (
        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/85 outline-none placeholder:text-white/35 focus:border-emerald-400/30 focus:ring-4 focus:ring-emerald-400/10"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  if (submitting) return
                  const text = commentText.trim()
                  if (!text) {
                    setError('Comment cannot be empty.')
                    return
                  }
                  if (!currentUserId) {
                    setError('You must be logged in to comment.')
                    return
                  }

                  setSubmitting(true)
                  setError(null)
                  try {
                    const { error: insertError } = await supabase.from('comments').insert({
                      post_id: postId,
                      user_id: currentUserId,
                      comment_text: text,
                    })
                    if (insertError) throw insertError

                    setCommentText('')
                    await load()
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to add comment.'
                    setError(message)
                  } finally {
                    setSubmitting(false)
                  }
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-6 py-4 sm:px-8">
        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {!allowView ? (
          <div className="text-sm text-white/60">Comments are hidden for your role.</div>
        ) : loading ? (
          <div className="text-sm text-white/60">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-white/50">No comments yet.</div>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => {
              const created = formatDateTime(c.created_at)
              const isDeleting = Boolean(deletingIds[c.id])
              return (
                <li
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-white">
                          {c.userName || 'Unknown user'}
                        </span>
                        {created ? <span className="text-xs text-white/40">{created}</span> : null}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/75">
                        {c.comment_text}
                      </p>
                    </div>

                    {allowDelete ? (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          if (isDeleting) return

                          const previous = comments
                          setDeletingIds((m) => ({ ...m, [c.id]: true }))
                          setComments((list) => list.filter((x) => x.id !== c.id))
                          setError(null)

                          try {
                            const { error: delError } = await supabase
                              .from('comments')
                              .delete()
                              .eq('id', c.id)
                            if (delError) throw delError
                          } catch (err) {
                            setComments(previous)
                            const message =
                              err instanceof Error ? err.message : 'Failed to delete comment.'
                            setError(message)
                          } finally {
                            setDeletingIds((m) => {
                              const next = { ...m }
                              delete next[c.id]
                              return next
                            })
                          }
                        }}
                        className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-xs font-medium text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

