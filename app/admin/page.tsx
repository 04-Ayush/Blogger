/* eslint-disable @next/next/no-img-element */
'use client'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import RoleGuard from '@/app/components/RoleGuard'

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/client'

type Trend = {
  value: string
  direction: 'up' | 'down' | 'flat'
}

type AdminStat = {
  label: string
  value: number
  trend: Trend
  icon: 'posts' | 'users' | 'authors' | 'comments'
}

type ActivityItem = {
  id: string
  title: string
  detail: string
  at: string | null
  tone: 'neutral' | 'success' | 'warning' | 'danger'
}

type AdminUserRow = {
  id: string
  name: string
  email: string
  role: 'viewer' | 'author' | 'admin'
  created_at: string | null
}

type ModerationPost = {
  id: string
  title: string
  author: string | null
  created_at: string | null
  summary: string | null
  status?: string | null
}

type ModerationComment = {
  id: string
  text: string
  user: string | null
  postTitle: string | null
  created_at: string | null
}

type UsersSelectRow = {
  id: string | number
  name?: string | null
  email?: string | null
  role?: string | null
  created_at?: string | null
}

type PostsSelectRow = {
  id: string | number
  title?: string | null
  summary?: string | null
  body?: string | null
  created_at?: string | null
  author_id?: string | number | null
  status?: string | null
  users?: { name?: string | null } | null
}

type CommentsSelectRow = {
  id: string | number
  comment_text?: string | null
  created_at?: string | null
  user_id?: string | number | null
  post_id?: string | number | null
  users?: { name?: string | null } | null
  posts?: { title?: string | null } | null
}

function toneDot(tone: ActivityItem['tone']) {
  if (tone === 'success') return 'bg-emerald-400'
  if (tone === 'warning') return 'bg-amber-400'
  if (tone === 'danger') return 'bg-rose-400'
  return 'bg-white/35'
}

function roleBadge(role: AdminUserRow['role']) {
  if (role === 'admin') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
  if (role === 'author') return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100'
  return 'border-white/10 bg-white/5 text-white/70'
}

function safeRole(value: unknown): AdminUserRow['role'] {
  if (value === 'admin' || value === 'author' || value === 'viewer') return value
  return 'viewer'
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(undefined).format(value)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function computeTrend(current: number | null, previous: number | null): Trend {
  if (current == null || previous == null || previous === 0) {
    if (current == null || previous == null) return { value: '—', direction: 'flat' }
    if (previous === 0) return { value: current === 0 ? '0%' : '+100%', direction: current === 0 ? 'flat' : 'up' }
  }

  const delta = (current ?? 0) - (previous ?? 0)
  const pct = previous ? Math.round((delta / previous) * 100) : 0
  const direction: Trend['direction'] = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
  const sign = pct > 0 ? '+' : ''
  return { value: `${sign}${pct}%`, direction }
}

function Icon({ name }: { name: AdminStat['icon'] }) {
  const cls = 'h-5 w-5'
  switch (name) {
    case 'posts':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M7 7.5h10M7 12h10M7 16.5h7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M6 3.8h12c1.2 0 2.2 1 2.2 2.2v12c0 1.2-1 2.2-2.2 2.2H6c-1.2 0-2.2-1-2.2-2.2V6C3.8 4.8 4.8 3.8 6 3.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M16.6 20.2c-.7-2.6-2.9-4.4-5.6-4.4s-4.9 1.8-5.6 4.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M11 12.9a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M18.8 10.3a3.2 3.2 0 1 0-3.4-5.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M20.6 20.2c-.3-1.2-1-2.3-2-3.1"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'authors':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M14.8 4.5H7.6c-1 0-1.8.8-1.8 1.8v12.9c0 1 .8 1.8 1.8 1.8h8.8c1 0 1.8-.8 1.8-1.8V9.2l-3.4-4.7Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14.8 4.5v4c0 .9.7 1.6 1.6 1.6h2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M9 13.1h6M9 16.6h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'comments':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden="true">
          <path
            d="M7.2 18.6 4 20.4l.7-3.6a8.2 8.2 0 1 1 2.5 1.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.4 10.6h7.2M8.4 13.8h5.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}

function AdminSectionHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
      <div className="text-white/90 font-medium">{title}</div>
      <div className="mt-1 text-white/55">{detail}</div>
    </div>
  )
}

function AdminStatCard({ stat }: { stat: AdminStat }) {
  const trendTone =
    stat.trend.direction === 'up'
      ? 'text-emerald-300'
      : stat.trend.direction === 'down'
        ? 'text-rose-200'
        : 'text-white/60'

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white/70">{stat.label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-white">{formatCompactNumber(stat.value)}</div>
          <div className={['mt-2 inline-flex items-center gap-2 text-xs font-medium', trendTone].join(' ')}>
            <span
              className={[
                'inline-flex h-5 items-center justify-center rounded-full border px-2',
                stat.trend.direction === 'up'
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : stat.trend.direction === 'down'
                    ? 'border-rose-500/20 bg-rose-500/10'
                    : 'border-white/10 bg-white/5',
              ].join(' ')}
            >
              {stat.trend.value}
            </span>
            <span className="text-white/45">vs last 30 days</span>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 transition group-hover:bg-emerald-500/15">
          <Icon name={stat.icon} />
        </div>
      </div>
    </div>
  )
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState title="No recent activity" detail="Platform events will appear here as they happen." />
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <AdminSectionHeader title="Recent Activity" subtitle="Latest platform events" />

      <div className="mt-5 space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="relative pl-6">
            <div className={['absolute left-1.5 top-2 h-2.5 w-2.5 rounded-full', toneDot(item.tone)].join(' ')} />
            {idx !== items.length - 1 ? (
              <div className="absolute left-2 top-6 h-[calc(100%-1.1rem)] w-px bg-white/10" />
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-1 text-sm text-white/60">{item.detail}</div>
              </div>
              <div className="shrink-0 text-xs text-white/45">{formatDateTime(item.at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersTable({ users }: { users: AdminUserRow[] }) {
  if (users.length === 0) {
    return <EmptyState title="No users yet" detail="When users register, you’ll be able to manage roles and access here." />
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <AdminSectionHeader
        title="User Management"
        subtitle="Manage roles, access, and account status"
        right={
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
            {users.length} users
          </div>
        }
      />

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wider text-white/40">
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const initial = u.name.trim().slice(0, 1).toUpperCase() || '•'
              return (
                <tr
                  key={u.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 transition hover:bg-white/6"
                >
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/80">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{u.name}</div>
                        <div className="text-xs text-white/45">ID: {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="truncate text-sm text-white/70">{u.email}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', roleBadge(u.role)].join(' ')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-white/70">{formatDate(u.created_at)}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 transition hover:bg-white/10"
                      >
                        Change Role
                      </button>
                      {/* <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-transparent px-3 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                      >
                        View Profile
                      </button> */}
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-500/15"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ModerationPosts({ posts, onDelete, deletingId }: { posts: ModerationPost[]; onDelete: (id: string) => void; deletingId: string | null }) {
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

function CommentsModeration({ comments, onDelete, deletingId }: { comments: ModerationComment[]; onDelete: (id: string) => void; deletingId: string | null }) {
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

function AnalyticsSummary({ viewers, authors, admins }: { viewers: number; authors: number; admins: number }) {
  const total = viewers + authors + admins
  const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100))
  const viewerPct = pct(viewers)
  const authorPct = pct(authors)
  const adminPct = pct(admins)

  const meter = (label: string, value: number, barClass: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/70">{label}</div>
        <div className="text-white/60">{value}%</div>
      </div>
      <div className="h-2 rounded-full border border-white/10 bg-slate-950/30">
        <div className={['h-full rounded-full', barClass].join(' ')} style={{ width: `${value}%` }} />
      </div>
    </div>
  )

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
      <AdminSectionHeader title="Analytics Summary" subtitle="Role distribution & platform health" />

      <div className="mt-5 space-y-4">
        {meter('Viewers', viewerPct, 'bg-white/25')}
        {meter('Authors', authorPct, 'bg-cyan-500/30')}
        {meter('Admins', adminPct, 'bg-emerald-500/35')}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { k: 'Health', v: 'Good', tone: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' },
            { k: 'Spam', v: 'Low', tone: 'border-white/10 bg-white/5 text-white/70' },
            { k: 'Activity', v: 'Steady', tone: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-100' },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/40">{m.k}</div>
              <div className={['mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', m.tone].join(' ')}>
                {m.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [stats, setStats] = useState<AdminStat[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [moderationPosts, setModerationPosts] = useState<ModerationPost[]>([])
  const [moderationComments, setModerationComments] = useState<ModerationComment[]>([])
  const [roleCounts, setRoleCounts] = useState<{ viewer: number; author: number; admin: number } | null>(null)

  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const now = new Date()
    const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
    const iso = (d: Date) => d.toISOString()
    const last30Start = iso(days(30))
    const prev30Start = iso(days(60))
    const prev30End = last30Start
    const nowIso = iso(now)

    const countAll = async (table: 'posts' | 'users' | 'comments') => {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) throw error
      return count ?? 0
    }

    const countUsersByRole = async (role: 'viewer' | 'author' | 'admin') => {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', role)
      if (error) throw error
      return count ?? 0
    }

    const countInRange = async (
      table: 'posts' | 'users' | 'comments',
      startIso: string,
      endIso: string,
      extra?: (q: any) => any
    ) => {
      let q: any = supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startIso)
        .lt('created_at', endIso)

      if (extra) q = extra(q)
      const { count, error } = await q
      if (error) throw error
      return count ?? 0
    }

    const safeUsersQuery = async () => {
      const withCreated = await supabase
        .from('users')
        .select('id,name,email,role,created_at')
        .order('created_at', { ascending: false })
        .limit(12)

      if (!withCreated.error) {
        const rows = (withCreated.data ?? []) as unknown as UsersSelectRow[]
        return rows.map((r) => ({
          id: String(r.id),
          name: String(r.name ?? '').trim() || 'Unknown',
          email: String(r.email ?? '').trim() || '—',
          role: safeRole(r.role),
          created_at: r.created_at ?? null,
        }))
      }

      const withoutCreated = await supabase.from('users').select('id,name,email,role').limit(12)
      if (withoutCreated.error) throw withCreated.error
      const rows = (withoutCreated.data ?? []) as unknown as UsersSelectRow[]
      return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name ?? '').trim() || 'Unknown',
        email: String(r.email ?? '').trim() || '—',
        role: safeRole(r.role),
        created_at: null,
      }))
    }

    const safePostsQuery = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error

      const posts = data ?? []

      const authorIds = [
        ...new Set(posts.map((p) => p.author_id).filter(Boolean)),
      ]

      let authorsMap = new Map()

      if (authorIds.length > 0) {
        const { data: authors } = await supabase
          .from('users')
          .select('id,name')
          .in('id', authorIds)

        authorsMap = new Map(
          (authors ?? []).map((u) => [String(u.id), u.name])
        )
      }

      return posts.map((p) => ({
        id: String(p.id),
        title: p.title ?? 'Untitled',
        author: authorsMap.get(String(p.author_id)) ?? 'Unknown',
        created_at: p.created_at,
        summary: p.summary ?? null,
        status: p.status ?? null,
      }))
    }

    const safeCommentsQuery = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const comments = data ?? []

      const userIds = [
        ...new Set(comments.map((c) => c.user_id).filter(Boolean)),
      ]

      const postIds = [
        ...new Set(comments.map((c) => c.post_id).filter(Boolean)),
      ]

      let usersMap = new Map()
      let postsMap = new Map()

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id,name')
          .in('id', userIds)

        usersMap = new Map(
          (users ?? []).map((u) => [String(u.id), u.name])
        )
      }

      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id,title')
          .in('id', postIds)

        postsMap = new Map(
          (posts ?? []).map((p) => [String(p.id), p.title])
        )
      }

      return comments.map((c) => ({
        id: String(c.id),
        text: c.comment_text ?? '',
        user: usersMap.get(String(c.user_id)) ?? 'Unknown',
        postTitle: postsMap.get(String(c.post_id)) ?? 'Unknown Post',
        created_at: c.created_at,
      }))
    }

    try {
      const [
        totalPosts,
        totalUsers,
        totalComments,
        authorsCount,
        viewerCount,
        authorCount,
        adminCount,
        postsLast30,
        postsPrev30,
        usersLast30,
        usersPrev30,
        commentsLast30,
        commentsPrev30,
        authorsLast30,
        authorsPrev30,
        recentUsers,
        recentPosts,
        recentComments,
      ] = await Promise.all([
        countAll('posts'),
        countAll('users'),
        countAll('comments'),
        countUsersByRole('author'),
        countUsersByRole('viewer'),
        countUsersByRole('author'),
        countUsersByRole('admin'),
        // trends (best-effort; depends on `created_at` columns)
        countInRange('posts', last30Start, nowIso),
        countInRange('posts', prev30Start, prev30End),
        countInRange('users', last30Start, nowIso),
        countInRange('users', prev30Start, prev30End),
        countInRange('comments', last30Start, nowIso),
        countInRange('comments', prev30Start, prev30End),
        countInRange('users', last30Start, nowIso, (q) => q.eq('role', 'author')),
        countInRange('users', prev30Start, prev30End, (q) => q.eq('role', 'author')),
        safeUsersQuery(),
        safePostsQuery(),
        safeCommentsQuery(),
      ])

      setRoleCounts({ viewer: viewerCount, author: authorCount, admin: adminCount })

      const nextStats: AdminStat[] = [
        { label: 'Total Posts', value: totalPosts, trend: computeTrend(postsLast30, postsPrev30), icon: 'posts' },
        { label: 'Total Users', value: totalUsers, trend: computeTrend(usersLast30, usersPrev30), icon: 'users' },
        { label: 'Total Authors', value: authorsCount, trend: computeTrend(authorsLast30, authorsPrev30), icon: 'authors' },
        { label: 'Total Comments', value: totalComments, trend: computeTrend(commentsLast30, commentsPrev30), icon: 'comments' },
      ]

      const postActivity: ActivityItem[] = recentPosts.map((p) => ({
        id: `post-${p.id}`,
        title: 'New post created',
        detail: p.author ? `“${p.title}” by ${p.author}` : `“${p.title}”`,
        at: p.created_at,
        tone: 'success',
      }))

      const userActivity: ActivityItem[] = recentUsers
        .filter((u) => Boolean(u.created_at))
        .map((u) => ({
          id: `user-${u.id}`,
          title: 'User registered',
          detail: `${u.email} joined as ${u.role}.`,
          at: u.created_at,
          tone: 'neutral',
        }))

      const commentActivity: ActivityItem[] = recentComments.map((c) => ({
        id: `comment-${c.id}`,
        title: 'New comment added',
        detail: `${c.user ?? 'Someone'} commented on ${c.postTitle ?? 'a post'}.`,
        at: c.created_at,
        tone: 'warning',
      }))

      const merged = [...postActivity, ...userActivity, ...commentActivity].sort((a, b) => {
        const atA = a.at ? new Date(a.at).getTime() : 0
        const atB = b.at ? new Date(b.at).getTime() : 0
        return atB - atA
      })

      setStats(nextStats)
      setUsers(recentUsers)
      setModerationPosts(recentPosts)
      setModerationComments(recentComments)
      setActivity(merged.slice(0, 12))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin dashboard.'
      setError(message)
      setStats([])
      setUsers([])
      setModerationPosts([])
      setModerationComments([])
      setActivity([])
      setRoleCounts(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
  load()

  const postsChannel = supabase
    .channel('admin-posts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'posts',
      },
      () => load()
    )
    .subscribe()

  const commentsChannel = supabase
    .channel('admin-comments')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
      },
      () => load()
    )
    .subscribe()

  const usersChannel = supabase
    .channel('admin-users')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
      },
      () => load()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(postsChannel)
    supabase.removeChannel(commentsChannel)
    supabase.removeChannel(usersChannel)
  }
}, [])

  const onDeletePost = useCallback(
    async (id: string) => {
      const ok = window.confirm('Delete this post? This action cannot be undone.')
      if (!ok) return
      if (deletingPostId) return

      setDeletingPostId(id)
      try {
        const { error } = await supabase.from('posts').delete().eq('id', id)
        if (error) throw error
        setModerationPosts((prev) => prev.filter((p) => p.id !== id))
        await load()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete post.'
        setError(message)
      } finally {
        setDeletingPostId(null)
      }
    },
    [deletingPostId, load, supabase]
  )

  const onDeleteComment = useCallback(
    async (id: string) => {
      const ok = window.confirm('Delete this comment?')
      if (!ok) return
      if (deletingCommentId) return

      setDeletingCommentId(id)
      try {
        const { error } = await supabase.from('comments').delete().eq('id', id)
        if (error) throw error
        setModerationComments((prev) => prev.filter((c) => c.id !== id))
        await load()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete comment.'
        setError(message)
      } finally {
        setDeletingCommentId(null)
      }
    },
    [deletingCommentId, load, supabase]
  )

  const roleDistribution = useMemo(() => {
    const counts = roleCounts
    if (!counts) return null
    const total = counts.viewer + counts.author + counts.admin
    const pct = (v: number) => (total === 0 ? 0 : Math.round((v / total) * 100))
    return {
      viewers: pct(counts.viewer),
      authors: pct(counts.author),
      admins: pct(counts.admin),
    }
  }, [roleCounts])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <RoleGuard allowed={['admin']} redirectTo="/dashboard">
            <div className="mx-auto w-full max-w-7xl">
              <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
                  <p className="mt-1 text-sm text-white/70">Platform management and moderation</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Admin
                </div>
              </div>

              {error ? (
                <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur"
                    >
                      <div className="h-4 w-28 rounded bg-white/10" />
                      <div className="mt-3 h-8 w-20 rounded bg-white/10" />
                      <div className="mt-3 h-4 w-40 rounded bg-white/10" />
                    </div>
                  ))
                ) : stats.length === 0 ? (
                  <EmptyState title="No stats available" detail="Counts will appear once the database is reachable." />
                ) : (
                  stats.map((s) => <AdminStatCard key={s.label} stat={s} />)
                )}
              </section>

              <section className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                      <div className="h-5 w-40 rounded bg-white/10" />
                      <div className="mt-4 space-y-3">
                        <div className="h-12 rounded-xl bg-white/5" />
                        <div className="h-12 rounded-xl bg-white/5" />
                        <div className="h-12 rounded-xl bg-white/5" />
                      </div>
                    </div>
                  ) : (
                    <ActivityFeed items={activity} />
                  )}
                </div>
                <div className="lg:col-span-7">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <AdminSectionHeader title="Analytics Summary" subtitle="Role distribution & platform health" />

                    {loading ? (
                      <div className="mt-5 space-y-4">
                        <div className="h-10 rounded-xl bg-white/5" />
                        <div className="h-10 rounded-xl bg-white/5" />
                        <div className="h-10 rounded-xl bg-white/5" />
                      </div>
                    ) : !roleDistribution ? (
                      <div className="mt-4">
                        <EmptyState title="No analytics yet" detail="Role distribution will appear once users exist." />
                      </div>
                    ) : (
                      <div className="mt-5 space-y-4">
                        {(
                          [
                            { label: 'Viewers', value: roleDistribution.viewers, bar: 'bg-white/25' },
                            { label: 'Authors', value: roleDistribution.authors, bar: 'bg-cyan-500/30' },
                            { label: 'Admins', value: roleDistribution.admins, bar: 'bg-emerald-500/35' },
                          ] as const
                        ).map((m) => (
                          <div key={m.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="text-white/70">{m.label}</div>
                              <div className="text-white/60">{m.value}%</div>
                            </div>
                            <div className="h-2 rounded-full border border-white/10 bg-slate-950/30">
                              <div className={['h-full rounded-full', m.bar].join(' ')} style={{ width: `${m.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="mt-6">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                    <div className="h-5 w-48 rounded bg-white/10" />
                    <div className="mt-4 h-28 rounded-xl bg-white/5" />
                  </div>
                ) : (
                  <UsersTable users={users} />
                )}
              </section>

              <section className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                      <div className="h-5 w-44 rounded bg-white/10" />
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="h-28 rounded-2xl bg-white/5" />
                        <div className="h-28 rounded-2xl bg-white/5" />
                      </div>
                    </div>
                  ) : (
                    <ModerationPosts posts={moderationPosts} onDelete={onDeletePost} deletingId={deletingPostId} />
                  )}
                </div>
                <div className="lg:col-span-5">
                  {loading ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                      <div className="h-5 w-48 rounded bg-white/10" />
                      <div className="mt-4 space-y-2">
                        <div className="h-20 rounded-2xl bg-white/5" />
                        <div className="h-20 rounded-2xl bg-white/5" />
                      </div>
                    </div>
                  ) : (
                    <CommentsModeration
                      comments={moderationComments}
                      onDelete={onDeleteComment}
                      deletingId={deletingCommentId}
                    />
                  )}
                </div>
              </section>
            </div>
          </RoleGuard>
        </main>
      </div>
    </div>
  )
}

