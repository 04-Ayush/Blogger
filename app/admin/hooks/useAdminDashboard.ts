'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { computeTrend, safeRole } from '../utils/adminHelpers'
import type { ActivityItem, AdminStat, AdminUserRow, ModerationComment, ModerationPost, UsersSelectRow } from '../utils/types'

export function useAdminDashboard() {
    const supabase = useMemo(() => createClient(), [])

    const DELETE_DIALOG_ANIM_MS = 160

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
    const [deletePostDialogId, setDeletePostDialogId] = useState<string | null>(null)
    const [deletePostDialogVisible, setDeletePostDialogVisible] = useState(false)
    const deletePostDialogCloseTimer = useRef<number | null>(null)

    const closeDeletePostDialog = useCallback(() => {
        if (deletingPostId) return
        setDeletePostDialogVisible(false)
        if (deletePostDialogCloseTimer.current) {
            window.clearTimeout(deletePostDialogCloseTimer.current)
        }
        deletePostDialogCloseTimer.current = window.setTimeout(() => {
            setDeletePostDialogId(null)
        }, DELETE_DIALOG_ANIM_MS)
    }, [DELETE_DIALOG_ANIM_MS, deletingPostId])

    useEffect(() => {
        return () => {
            if (deletePostDialogCloseTimer.current) {
                window.clearTimeout(deletePostDialogCloseTimer.current)
            }
        }
    }, [])

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

            const authorIds = [...new Set(posts.map((p) => p.author_id).filter(Boolean))]

            let authorsMap = new Map()

            if (authorIds.length > 0) {
                const { data: authors } = await supabase.from('users').select('id,name').in('id', authorIds)

                authorsMap = new Map((authors ?? []).map((u) => [String(u.id), u.name]))
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

            const userIds = [...new Set(comments.map((c) => c.user_id).filter(Boolean))]

            const postIds = [...new Set(comments.map((c) => c.post_id).filter(Boolean))]

            let usersMap = new Map()
            let postsMap = new Map()

            if (userIds.length > 0) {
                const { data: users } = await supabase.from('users').select('id,name').in('id', userIds)

                usersMap = new Map((users ?? []).map((u) => [String(u.id), u.name]))
            }

            if (postIds.length > 0) {
                const { data: posts } = await supabase.from('posts').select('id,title').in('id', postIds)

                postsMap = new Map((posts ?? []).map((p) => [String(p.id), p.title]))
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

    const performDeletePost = useCallback(
        async (id: string) => {
            if (deletingPostId) return

            setDeletingPostId(id)
            setError(null)
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
                closeDeletePostDialog()
            }
        },
        [closeDeletePostDialog, deletingPostId, load, supabase]
    )

    const onDeletePost = useCallback((id: string) => {
        if (deletePostDialogCloseTimer.current) {
            window.clearTimeout(deletePostDialogCloseTimer.current)
            deletePostDialogCloseTimer.current = null
        }
        setDeletePostDialogId(id)
        setDeletePostDialogVisible(false)
        window.requestAnimationFrame(() => setDeletePostDialogVisible(true))
    }, [])

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

    return {
        loading,
        error,
        stats,
        users,
        activity,
        moderationPosts,
        moderationComments,
        roleDistribution,
        deletingPostId,
        deletingCommentId,
        deletePostDialogId,
        deletePostDialogVisible,
        onDeletePost,
        onDeleteComment,
        performDeletePost,
        closeDeletePostDialog,
    }
}
