export type Trend = {
    value: string
    direction: 'up' | 'down' | 'flat'
}

export type AdminStat = {
    label: string
    value: number
    trend: Trend
    icon: 'posts' | 'users' | 'authors' | 'comments'
}

export type ActivityItem = {
    id: string
    title: string
    detail: string
    at: string | null
    tone: 'neutral' | 'success' | 'warning' | 'danger'
}

export type AdminUserRow = {
    id: string
    name: string
    email: string
    role: 'viewer' | 'author' | 'admin'
    created_at: string | null
}

export type ModerationPost = {
    id: string
    title: string
    author: string | null
    created_at: string | null
    summary: string | null
    status?: string | null
}

export type ModerationComment = {
    id: string
    text: string
    user: string | null
    postTitle: string | null
    created_at: string | null
}

export type UsersSelectRow = {
    id: string | number
    name?: string | null
    email?: string | null
    role?: string | null
    created_at?: string | null
}

export type PostsSelectRow = {
    id: string | number
    title?: string | null
    summary?: string | null
    body?: string | null
    created_at?: string | null
    author_id?: string | number | null
    status?: string | null
    users?: { name?: string | null } | null
}

export type CommentsSelectRow = {
    id: string | number
    comment_text?: string | null
    created_at?: string | null
    user_id?: string | number | null
    post_id?: string | number | null
    users?: { name?: string | null } | null
    posts?: { title?: string | null } | null
}
