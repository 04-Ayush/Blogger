'use client'

import type { DashboardAnalytics, DashboardStat, RecentComment, RecentPost } from '../utils/types'
import type { BookmarksState } from '../utils/types'

import DashboardStats from './DashboardStats'
import RecentPostsWidget from './RecentPostsWidget'
import RecentCommentsWidget from './RecentCommentsWidget'
import AnalyticsCard from './AnalyticsCard'
import ActivityTimeline from './ActivityTimeline'
import type { ActivityItem } from '../utils/types'

type Props = {
    stats: DashboardStat[]
    recentPosts: RecentPost[]
    recentComments: RecentComment[]
    bookmarks: BookmarksState
    analytics: DashboardAnalytics | null
    activity: ActivityItem[]
}

export default function AuthorDashboard({
    stats,
    recentPosts,
    recentComments,
    bookmarks,
    analytics,
    activity,
}: Props) {
    return (
        <div>
            <DashboardStats stats={stats} />

            <RecentPostsWidget
                title="Your recent posts"
                subtitle="Latest drafts and publications from you."
                posts={recentPosts}
                bookmarks={bookmarks}
                emptyTitle="No posts written yet."
                emptyDetail="Create your first post to see it here."
            />

            <RecentCommentsWidget
                title="Recent comments on your posts"
                subtitle="Stay on top of engagement."
                comments={recentComments}
                emptyTitle="No comments yet."
                emptyDetail="When people comment on your posts, they’ll show up here."
            />

            <AnalyticsCard analytics={analytics} />

            <ActivityTimeline activity={activity} />
        </div>
    )
}
