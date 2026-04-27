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

export default function ViewerDashboard({
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
                title="Recent posts"
                subtitle="Browse what’s new on the platform."
                posts={recentPosts}
                bookmarks={bookmarks}
                emptyTitle="No posts found."
                emptyDetail="Once posts are published, they’ll appear here."
            />

            <RecentCommentsWidget
                title="Your recent comments"
                subtitle="A quick recap of what you’ve replied to."
                comments={recentComments}
            />

            <AnalyticsCard analytics={analytics} />

            <ActivityTimeline activity={activity} />
        </div>
    )
}
