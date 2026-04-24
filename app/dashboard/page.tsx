'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/lib/auth/roles'
import { getCurrentUserRole } from '@/lib/auth/roles'

import Navbar from '@/app/components/Navbar'
import Sidebar from '@/app/components/Sidebar'
import Postcard, { type PostcardPost } from '@/app/components/Postcard'

export default function Dashboard() {
  const supabase = createClient()
  const [role, setRole] = useState<Role>('viewer')
  const [posts, setPosts] = useState<PostcardPost[]>([])

  useEffect(() => {
    const getUserRole = async () => {
      const { role } = await getCurrentUserRole()
      setRole(role)
    }

    getUserRole()
  }, [])

  useEffect(() => {
    let cancelled = false
  
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) {
        if (!cancelled) setPosts([])
        return
      }

      let q = supabase
        .from('posts')
        .select('id,title,body,created_at,author_id')
        .order('created_at', { ascending: false })

      // authors see only their own posts on dashboard; admin + viewer see all
      if (role === 'author') {
        q = q.eq('author_id', user.id)
      }

      const { data, error } = await q
  
      if (error) {
        console.log(error)
        if (!cancelled) setPosts([])
        return
      }
  
      if (!cancelled) {
        setPosts(
          (data ?? []).map((p) => ({
            id: String(p.id),
            title: p.title,
            excerpt: (p.body ?? '').slice(0, 180),
            authorName: 'You',
            createdAt: p.created_at,
          }))
        )
      }
    })()
  
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />

      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-white/70">Your role: {role || '—'}</p>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              No posts written yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {posts.map((post) => (
                <Postcard
                  key={post.id}
                  post={post}
                  href={`/posts/${post.id}`}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}