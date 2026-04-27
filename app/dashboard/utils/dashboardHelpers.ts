import type { Role } from '@/lib/auth/roles'

import type { ActivityItem, DashboardAnalytics, RecentComment, RecentPost, RecentUser } from './types'

export function getGreetingByTime(now = new Date()): string {
    const hour = now.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

export function getDashboardTitle(role: Role): string {
    if (role === 'admin') return 'Admin Dashboard'
    if (role === 'author') return 'Author Dashboard'
    return 'Dashboard'
}

export function getRoleAccent(role: Role): { badge: string; dot: string } {
    if (role === 'admin') {
        return {
            badge: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
            dot: 'bg-amber-400',
        }
    }

    if (role === 'author') {
        return {
            badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
            dot: 'bg-emerald-400',
        }
    }

    return {
        badge: 'border-sky-500/20 bg-sky-500/10 text-sky-200',
        dot: 'bg-sky-400',
    }
}

export function calculateEngagement(postsCount: number, commentsCount: number, bookmarksCount: number): DashboardAnalytics {
    const safePosts = Math.max(0, postsCount)
    const safeComments = Math.max(0, commentsCount)
    const safeBookmarks = Math.max(0, bookmarksCount)

    const score = safePosts === 0 ? (safeComments + safeBookmarks) : (safeComments + safeBookmarks) / safePosts

    let label = 'Low'
    if (score >= 4) label = 'High'
    else if (score >= 2) label = 'Medium'

    return {
        engagementScore: score,
        engagementLabel: label,
        primaryMetricLabel: 'Engagement',
        primaryMetricValue: Math.round(score * 10) / 10,
    }
}

export function buildActivityFeed(input: {
    posts?: RecentPost[]
    comments?: RecentComment[]
    users?: RecentUser[]
}): ActivityItem[] {
    const items: ActivityItem[] = []

    for (const p of input.posts ?? []) {
        items.push({
            id: `post-${p.id}`,
            title: 'New post',
            detail: p.authorName ? `“${p.title}” by ${p.authorName}` : `“${p.title}”`,
            at: p.createdAt,
            tone: 'success',
        })
    }

    for (const c of input.comments ?? []) {
        items.push({
            id: `comment-${c.id}`,
            title: 'New comment',
            detail: c.postTitle ? `On “${c.postTitle}”` : 'On a post',
            at: c.createdAt,
            tone: 'neutral',
        })
    }

    for (const u of input.users ?? []) {
        items.push({
            id: `user-${u.id}`,
            title: 'New user',
            detail: `${u.email} joined as ${u.role}`,
            at: u.createdAt,
            tone: 'warning',
        })
    }

    return items
        .sort((a, b) => {
            const atA = a.at ? new Date(a.at).getTime() : 0
            const atB = b.at ? new Date(b.at).getTime() : 0
            return atB - atA
        })
        .slice(0, 12)
}
