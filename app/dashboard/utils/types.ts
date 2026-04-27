import type { Role } from '@/lib/auth/roles'

export type DashboardStat = {
    label: string
    value: number
    hint?: string | null
}

export type RecentPost = {
    id: string
    title: string
    excerpt: string
    authorName: string | null
    createdAt: string | null
    summary?: string | null
    status?: string | null
}

export type RecentComment = {
    id: string
    text: string
    userName: string | null
    postId: string | null
    postTitle: string | null
    createdAt: string | null
}

export type RecentUser = {
    id: string
    name: string
    email: string
    role: Role
    createdAt: string | null
}

export type DashboardAnalytics = {
    engagementScore: number
    engagementLabel: string
    primaryMetricLabel: string
    primaryMetricValue: number
}

export type ActivityItem = {
    id: string
    title: string
    detail: string
    at: string | null
    tone: 'neutral' | 'success' | 'warning'
}

export type RoleDistribution = {
    viewer: number
    author: number
    admin: number
}

export type BookmarksState = {
    count: number
    byPostId: Record<string, boolean>
    busyPostId: string | null
    toggle: (postId: string) => Promise<void>
}
