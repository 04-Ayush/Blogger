'use client'

import Link from 'next/link'

export type PostcardPost = {
  id: string
  title: string
  summary?: string | null
  excerpt?: string | null
  authorName?: string | null
  createdAt?: string | null
  status?: 'draft' | 'published' | 'archived' | string
}

type Props = {
  post: PostcardPost
  href?: string
  onEdit?: (post: PostcardPost) => void
  onDelete?: (post: PostcardPost) => void
  bookmarked?: boolean
  onToggleBookmark?: (postId: string) => void
}

function formatDate(value?: string | null) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Postcard({ post, href, onEdit, onDelete, bookmarked, onToggleBookmark }: Props) {
  const dateLabel = formatDate(post.createdAt)
  const canEdit = typeof onEdit === 'function'
  const canDelete = typeof onDelete === 'function'
  const canToggleBookmark = typeof onToggleBookmark === 'function'

  const CardInner = (
    <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:bg-white/[0.07]">
      <button
        type="button"
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        aria-pressed={Boolean(bookmarked)}
        onClick={(e) => {
          e.preventDefault()
          if (!canToggleBookmark) return
          onToggleBookmark(String(post.id))
        }}
        disabled={!canToggleBookmark}
        className={[
          'absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border backdrop-blur transition',
          'border-white/10 bg-slate-950/40 hover:bg-white/10',
          !canToggleBookmark ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        <svg
          viewBox="0 0 24 24"
          className={[
            'h-5 w-5',
            bookmarked ? 'text-emerald-300' : 'text-white/70',
          ].join(' ')}
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

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-white">
              {post.title || 'Untitled'}
            </h3>

            {post.status ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/70">
                {post.status}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
            {post.authorName ? <span>{post.authorName}</span> : null}
            {post.authorName && dateLabel ? <span className="text-white/20">•</span> : null}
            {dateLabel ? <span>{dateLabel}</span> : null}
          </div>

          {post.summary ? (
            <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-300">
                AI Summary
              </p>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/75">
                {post.summary}
              </p>
            </div>
          ) : post.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70">
              {post.excerpt}
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/40">
              No summary available.
            </p>
          )}
        </div>

        {(canEdit || canDelete) ? (
          <div className="flex shrink-0 items-center gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onEdit(post)
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                Edit
              </button>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onDelete(post)
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15"
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )

  return href ? (
    <Link href={href} className="block focus:outline-none focus:ring-4 focus:ring-emerald-400/10 rounded-2xl">
      {CardInner}
    </Link>
  ) : (
    CardInner
  )
}