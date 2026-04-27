'use client'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'

import { useDashboardData } from './hooks/useDashboardData'

import DashboardHeader from './components/DashboardHeader'
import ViewerDashboard from './components/ViewerDashboard'
import AuthorDashboard from './components/AuthorDashboard'
import AdminDashboard from './components/AdminDashboard'

export default function DashboardPage() {
  const {
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
  } = useDashboardData()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <DashboardHeader role={role} />

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Loading dashboard...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
              {error}
            </div>
          ) : role === 'admin' ? (
            <AdminDashboard
              stats={stats}
              recentPosts={recentPosts}
              recentComments={recentComments}
              recentUsers={recentUsers}
              bookmarks={bookmarks}
              analytics={analytics}
              activity={activity}
              roleDistribution={roleDistribution}
            />
          ) : role === 'author' ? (
            <AuthorDashboard
              stats={stats}
              recentPosts={recentPosts}
              recentComments={recentComments}
              bookmarks={bookmarks}
              analytics={analytics}
              activity={activity}
            />
          ) : (
            <ViewerDashboard
              stats={stats}
              recentPosts={recentPosts}
              recentComments={recentComments}
              bookmarks={bookmarks}
              analytics={analytics}
              activity={activity}
            />
          )}
        </main>
      </div>
    </div>
  )
}
