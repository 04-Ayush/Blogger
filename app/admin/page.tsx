'use client'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import RoleGuard from '@/app/components/RoleGuard'

import { useAdminDashboard } from './hooks/useAdminDashboard'

import AdminHeader from './components/AdminHeader'
import AdminStatsGrid from './components/AdminStatsGrid'
import ActivityFeed from './components/ActivityFeed'
import AnalyticsSummary from './components/AnalyticsSummary'
import UsersTable from './components/UsersTable'
import ModerationPosts from './components/ModerationPosts'
import CommentsModeration from './components/CommentsModeration'
import DeletePostDialog from './components/DeletePostDialog'

export default function AdminPage() {
    const {
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
    } = useAdminDashboard()

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="flex min-h-screen">
                <Sidebar />

                <main className="flex-1 px-4 py-6">
                    <RoleGuard allowed={['admin']} redirectTo="/dashboard">
                        <DeletePostDialog
                            deletePostDialogId={deletePostDialogId}
                            deletePostDialogVisible={deletePostDialogVisible}
                            deletingPostId={deletingPostId}
                            closeDeletePostDialogAction={closeDeletePostDialog}
                            performDeletePostAction={performDeletePost}
                        />

                        <div className="mx-auto w-full max-w-7xl">
                            <AdminHeader />

                            {error ? (
                                <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                                    {error}
                                </div>
                            ) : null}

                            <AdminStatsGrid loading={loading} stats={stats} />

                            <section className="mt-6 grid gap-4 lg:grid-cols-12">
                                <div className="lg:col-span-5">
                                    <ActivityFeed loading={loading} items={activity} />
                                </div>
                                <div className="lg:col-span-7">
                                    <AnalyticsSummary loading={loading} roleDistribution={roleDistribution} />
                                </div>
                            </section>

                            <section className="mt-6">
                                <UsersTable loading={loading} users={users} />
                            </section>

                            <section className="mt-6 grid gap-4 lg:grid-cols-12">
                                <div className="lg:col-span-7">
                                    <ModerationPosts
                                        loading={loading}
                                        posts={moderationPosts}
                                        onDelete={onDeletePost}
                                        deletingId={deletingPostId}
                                    />
                                </div>
                                <div className="lg:col-span-5">
                                    <CommentsModeration
                                        loading={loading}
                                        comments={moderationComments}
                                        onDelete={onDeleteComment}
                                        deletingId={deletingCommentId}
                                    />
                                </div>
                            </section>
                        </div>
                    </RoleGuard>
                </main>
            </div>
        </div>
    )
}
