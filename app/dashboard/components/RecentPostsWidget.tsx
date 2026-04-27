'use client'

import Postcard from '@/app/components/Postcard'
import type { PostcardPost } from '@/app/components/Postcard'

import DashboardSectionHeader from './DashboardSectionHeader'
import EmptyDashboardState from './EmptyDashboardState'

import type { BookmarksState, RecentPost } from '../utils/types'

type Props = {
    title: string
    subtitle?: string | null
    posts: RecentPost[]
    bookmarks: BookmarksState
    emptyTitle?: string
    emptyDetail?: string
}

export default function RecentPostsWidget({
    title,
    subtitle,
    posts,
    bookmarks,
    emptyTitle,
    emptyDetail,
}: Props) {
    const cards: PostcardPost[] = (posts ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        authorName: p.authorName,
        createdAt: p.createdAt,
        summary: p.summary ?? null,
        status: p.status ?? undefined,
    }))

    return (
        <section className="mt-6">
            <DashboardSectionHeader title={title} subtitle={subtitle ?? undefined} />

            {cards.length === 0 ? (
                <EmptyDashboardState
                    title={emptyTitle ?? 'No posts written yet.'}
                    detail={emptyDetail ?? 'Create a post to see it here.'}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {cards.map((post) => (
                        <Postcard
                            key={post.id}
                            post={post}
                            href={`/posts/${post.id}`}
                            bookmarked={Boolean(bookmarks.byPostId[post.id])}
                            onToggleBookmark={bookmarks.toggle}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
