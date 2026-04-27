'use client'

import type {
    ActivityItem,
    DashboardAnalytics,
    DashboardStat,
    RecentComment,
    RecentPost,
    RecentUser,
    RoleDistribution,
} from '../utils/types'
import type { BookmarksState } from '../utils/types'

import DashboardStats from './DashboardStats'
import RecentPostsWidget from './RecentPostsWidget'
import RecentCommentsWidget from './RecentCommentsWidget'
import RecentUsersWidget from './RecentUsersWidget'
import ActivityTimeline from './ActivityTimeline'
import DashboardSectionHeader from './DashboardSectionHeader'

function RoleDistributionCard({ distribution }: { distribution: RoleDistribution | null }) {
    if (!distribution) return null

    return (
        <section className="mt-6">
            <DashboardSectionHeader
                title="Roles"
                subtitle="Current distribution of user roles."
            />

            <div className="grid gap-4 sm:grid-cols-3">
                {([
                    { label: 'Viewers', value: distribution.viewer },
                    { label: 'Authors', value: distribution.author },
                    { label: 'Admins', value: distribution.admin },
                ] as const).map((r) => (
                    <div
                        key={r.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur"
                    >
                        <p className="text-xs font-medium text-white/60">{r.label}</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{r.value}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

type Props = {
    stats: DashboardStat[]
    recentPosts: RecentPost[]
    recentComments: RecentComment[]
    recentUsers: RecentUser[]
    bookmarks: BookmarksState
    analytics: DashboardAnalytics | null
    activity: ActivityItem[]
    roleDistribution: RoleDistribution | null
}

export default function AdminDashboard({
    stats,
    recentPosts,
    recentComments,
    recentUsers,
    bookmarks,
    analytics,
    activity,
    roleDistribution,
}: Props) {
    return (
        <div>
            <DashboardStats stats={stats} />

            <RoleDistributionCard distribution={roleDistribution} />

            <RecentUsersWidget
                title="Recent users"
                subtitle="Newest registrations on the platform."
                users={recentUsers}
            />

            <RecentPostsWidget
                title="Recent posts"
                subtitle="Latest content published across the platform."
                posts={recentPosts}
                bookmarks={bookmarks}
                emptyTitle="No posts found."
                emptyDetail="Once posts are created, they’ll appear here."
            />

            <RecentCommentsWidget
                title="Recent comments"
                subtitle="Most recent replies across all posts."
                comments={recentComments}
            />
            <ActivityTimeline activity={activity} />
        </div>
    )
}
