'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { getCurrentUserRole } from '@/lib/auth/roles'
import type { Role } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/client'

import { buildActivityFeed, calculateEngagement } from '../utils/dashboardHelpers'
import type {
    ActivityItem,
    BookmarksState,
    DashboardAnalytics,
    DashboardStat,
    RecentComment,
    RecentPost,
    RecentUser,
    RoleDistribution,
} from '../utils/types'

type HookReturn = {
    loading: boolean
    error: string | null
    role: Role
    stats: DashboardStat[]
    recentPosts: RecentPost[]
    recentComments: RecentComment[]
    recentUsers: RecentUser[]
    bookmarks: BookmarksState
    analytics: DashboardAnalytics | null
    activity: ActivityItem[]
    roleDistribution: RoleDistribution | null
}

export function useDashboardData(): HookReturn {
    const supabase = useMemo(() => createClient(), [])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [role, setRole] = useState<Role>('viewer')
    const [userId, setUserId] = useState<string | null>(null)

    const [stats, setStats] = useState<DashboardStat[]>([])
    const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
    const [recentComments, setRecentComments] = useState<RecentComment[]>([])
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])

    const [roleDistribution, setRoleDistribution] = useState<RoleDistribution | null>(null)
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
    const [activity, setActivity] = useState<ActivityItem[]>([])

    const [bookmarkedById, setBookmarkedById] = useState<Record<string, boolean>>({})
    const [bookmarkBusyId, setBookmarkBusyId] = useState<string | null>(null)
    const [bookmarksCount, setBookmarksCount] = useState(0)

    const toggleBookmark = useCallback(
        async (postId: string) => {
            if (!userId) return
            if (bookmarkBusyId) return

            const isBookmarked = Boolean(bookmarkedById[postId])
            setBookmarkBusyId(postId)
            setBookmarkedById((prev) => ({ ...prev, [postId]: !isBookmarked }))

            try {
                if (isBookmarked) {
                    const { error: delError } = await supabase
                        .from('bookmarks')
                        .delete()
                        .eq('user_id', userId)
                        .eq('post_id', postId)
                    if (delError) throw delError
                    setBookmarksCount((c) => Math.max(0, c - 1))
                } else {
                    const { error: insError } = await supabase
                        .from('bookmarks')
                        .insert([{ user_id: userId, post_id: postId }])
                    if (insError) throw insError
                    setBookmarksCount((c) => c + 1)
                }
            } catch {
                setBookmarkedById((prev) => ({ ...prev, [postId]: isBookmarked }))
            } finally {
                setBookmarkBusyId(null)
            }
        },
        [bookmarkBusyId, bookmarkedById, supabase, userId]
    )

    const bookmarks: BookmarksState = useMemo(
        () => ({
            count: bookmarksCount,
            byPostId: bookmarkedById,
            busyPostId: bookmarkBusyId,
            toggle: toggleBookmark,
        }),
        [bookmarksCount, bookmarkedById, bookmarkBusyId, toggleBookmark]
    )

    const load = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const current = await getCurrentUserRole()
            setRole(current.role)
            setUserId(current.userId)

            if (!current.userId) {
                setStats([])
                setRecentPosts([])
                setRecentComments([])
                setRecentUsers([])
                setRoleDistribution(null)
                setAnalytics(null)
                setActivity([])
                setBookmarksCount(0)
                setBookmarkedById({})
                setError('Please login to view your dashboard.')
                return
            }

            const isAdmin = current.role === 'admin'
            const isAuthor = current.role === 'author'

            const myAuthoredPostIds = isAuthor
                ? (
                    await supabase
                        .from('posts')
                        .select('id')
                        .eq('author_id', current.userId)
                        .order('created_at', { ascending: false })
                        .limit(200)
                )
                : null

            if (myAuthoredPostIds?.error) throw myAuthoredPostIds.error
            const authoredIds = (myAuthoredPostIds?.data ?? [])
                .map((p: any) => String(p.id))
                .filter(Boolean)

            const count = async (table: 'posts' | 'comments' | 'users' | 'bookmarks', extra?: (q: any) => any) => {
                let q: any = supabase.from(table).select('*', { count: 'exact', head: true })
                if (extra) q = extra(q)
                const { count, error } = await q
                if (error) throw error
                return count ?? 0
            }

            const roleCounts = async (): Promise<RoleDistribution> => {
                const [viewer, author, admin] = await Promise.all([
                    count('users', (q) => q.eq('role', 'viewer')),
                    count('users', (q) => q.eq('role', 'author')),
                    count('users', (q) => q.eq('role', 'admin')),
                ])
                return { viewer, author, admin }
            }

            const postsQuery = () => {
                let q: any = supabase
                    .from('posts')
                    .select('id,title,body,summary,created_at,author_id')
                    .order('created_at', { ascending: false })
                    .limit(6)

                if (isAuthor) q = q.eq('author_id', current.userId)
                return q
            }

            const commentsQuery = async (): Promise<any> => {
                if (isAdmin) {
                    return supabase
                        .from('comments')
                        .select('id,comment_text,created_at,post_id,user_id')
                        .order('created_at', { ascending: false })
                        .limit(6)
                }

                if (isAuthor) {
                    if (authoredIds.length === 0) {
                        return { data: [], error: null }
                    }

                    return supabase
                        .from('comments')
                        .select('id,comment_text,created_at,post_id,user_id')
                        .in('post_id', authoredIds)
                        .order('created_at', { ascending: false })
                        .limit(6)
                }

                // viewer
                return supabase
                    .from('comments')
                    .select('id,comment_text,created_at,post_id,user_id')
                    .eq('user_id', current.userId)
                    .order('created_at', { ascending: false })
                    .limit(6)
            }

            const usersQuery = () =>
                supabase
                    .from('users')
                    .select('id,name,email,role,created_at')
                    .order('created_at', { ascending: false })
                    .limit(6)

            const [
                postsRes,
                commentsRes,
                usersRes,
                bmCount,
                postsCount,
                commentsCount,
                usersCount,
                allBookmarksCount,
                dist,
            ] = await Promise.all([
                postsQuery(),
                commentsQuery(),
                isAdmin ? usersQuery() : Promise.resolve({ data: [], error: null }),
                count('bookmarks', (q) => q.eq('user_id', current.userId)),
                count('posts', (q) => (isAuthor ? q.eq('author_id', current.userId) : q)),
                isAdmin
                    ? count('comments')
                    : isAuthor
                        ? (authoredIds.length === 0
                            ? Promise.resolve(0)
                            : count('comments', (q) => q.in('post_id', authoredIds)))
                        : count('comments', (q) => q.eq('user_id', current.userId)),
                isAdmin ? count('users') : Promise.resolve(0),
                isAdmin ? count('bookmarks') : Promise.resolve(0),
                isAdmin ? roleCounts() : Promise.resolve(null),
            ])

            if (postsRes.error) throw postsRes.error
            if (commentsRes.error) throw commentsRes.error
            if (usersRes.error) throw usersRes.error

            setBookmarksCount(bmCount)

            const rawPosts: any[] = postsRes.data ?? []
            const authorIds = [...new Set(rawPosts.map((p) => p.author_id).filter(Boolean).map((v) => String(v)))]

            let authorsMap = new Map<string, string>()
            if (authorIds.length > 0 && !isAuthor) {
                const { data: authors } = await supabase.from('users').select('id,name').in('id', authorIds)
                authorsMap = new Map((authors ?? []).map((u: any) => [String(u.id), String(u.name ?? '').trim() || 'Unknown']))
            }

            const mappedPosts: RecentPost[] = rawPosts.map((p) => ({
                id: String(p.id),
                title: String(p.title ?? 'Untitled'),
                excerpt: String(p.body ?? '').slice(0, 180),
                authorName: isAuthor ? 'You' : (authorsMap.get(String(p.author_id)) ?? null),
                createdAt: p.created_at ?? null,
                summary: isAuthor ? null : (p.summary ?? null),
                status: null,
            }))
            setRecentPosts(mappedPosts)

            const postIds = mappedPosts.map((p) => p.id)
            if (postIds.length > 0) {
                const { data: bmRows, error: bmError } = await supabase
                    .from('bookmarks')
                    .select('post_id')
                    .eq('user_id', current.userId)
                    .in('post_id', postIds)

                if (!bmError) {
                    const next: Record<string, boolean> = {}
                    for (const row of bmRows ?? []) {
                        const id = String((row as any).post_id)
                        if (id) next[id] = true
                    }
                    setBookmarkedById(next)
                } else {
                    setBookmarkedById({})
                }
            } else {
                setBookmarkedById({})
            }

            const rawComments: any[] = commentsRes.data ?? []
            const commentUserIds = [...new Set(rawComments.map((c) => c.user_id).filter(Boolean).map((v) => String(v)))]
            const commentPostIds = [...new Set(rawComments.map((c) => c.post_id).filter(Boolean).map((v) => String(v)))]

            let usersMap = new Map<string, string>()
            let postsMap = new Map<string, string>()

            if (commentUserIds.length > 0) {
                const { data: users } = await supabase.from('users').select('id,name').in('id', commentUserIds)
                usersMap = new Map((users ?? []).map((u: any) => [String(u.id), String(u.name ?? '').trim() || 'Unknown']))
            }

            if (commentPostIds.length > 0) {
                const { data: posts } = await supabase.from('posts').select('id,title').in('id', commentPostIds)
                postsMap = new Map((posts ?? []).map((p: any) => [String(p.id), String(p.title ?? 'Untitled')]))
            }

            const mappedComments: RecentComment[] = rawComments.map((c) => ({
                id: String(c.id),
                text: String(c.comment_text ?? ''),
                userName: usersMap.get(String(c.user_id)) ?? null,
                postId: c.post_id ? String(c.post_id) : null,
                postTitle: postsMap.get(String(c.post_id)) ?? null,
                createdAt: c.created_at ?? null,
            }))
            setRecentComments(mappedComments)

            const mappedUsers: RecentUser[] = (usersRes.data ?? []).map((u: any) => ({
                id: String(u.id),
                name: String(u.name ?? '').trim() || 'Unknown',
                email: String(u.email ?? '').trim() || '—',
                role: (u.role === 'admin' || u.role === 'author' || u.role === 'viewer') ? u.role : 'viewer',
                createdAt: u.created_at ?? null,
            }))
            setRecentUsers(mappedUsers)

            setRoleDistribution(dist)

            const nextStats: DashboardStat[] = []

            if (isAdmin) {
                nextStats.push(
                    { label: 'Users', value: usersCount },
                    { label: 'Posts', value: postsCount },
                    { label: 'Comments', value: commentsCount },
                    { label: 'Bookmarks', value: allBookmarksCount }
                )
            } else if (isAuthor) {
                nextStats.push(
                    { label: 'Your posts', value: postsCount },
                    { label: 'Your bookmarks', value: bmCount },
                    { label: 'Recent comments', value: mappedComments.length }
                )
            } else {
                nextStats.push(
                    { label: 'Recent posts', value: mappedPosts.length },
                    { label: 'Your bookmarks', value: bmCount },
                    { label: 'Your comments', value: commentsCount }
                )
            }

            setStats(nextStats)

            const computedAnalytics = calculateEngagement(
                postsCount,
                commentsCount,
                isAdmin ? allBookmarksCount : bmCount
            )
            setAnalytics(computedAnalytics)

            setActivity(
                buildActivityFeed({
                    posts: mappedPosts,
                    comments: mappedComments,
                    users: isAdmin ? mappedUsers : [],
                })
            )
        } catch (e: any) {
            setError(e?.message ? String(e.message) : 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        load()
    }, [load])

    return {
        loading,
        error,
        role,
        stats,
        recentPosts,
        recentComments,
        recentUsers,
        bookmarks,
        analytics,
        activity,
        roleDistribution,
    }
}
