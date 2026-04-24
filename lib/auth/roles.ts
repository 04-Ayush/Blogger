import { createClient } from '@/lib/supabase/client'

export type Role = 'viewer' | 'author' | 'admin'

export type CurrentUserRole = {
  userId: string | null
  role: Role
}

function normalizeRole(value: unknown): Role {
  if (value === 'admin' || value === 'author' || value === 'viewer') return value
  return 'viewer'
}

/**
 * Fetches the logged-in user's role from `users.role` by auth user id.
 * Defaults to `viewer` if missing/unknown.
 */
export async function getCurrentUserRole(): Promise<CurrentUserRole> {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { userId: null, role: 'viewer' }
  }

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) {
    return { userId: user.id, role: 'viewer' }
  }

  return { userId: user.id, role: normalizeRole(data?.role) }
}

export function canCreatePosts(role: Role) {
  // Admin can manage (edit/delete) but should not create new posts
  return role === 'author'
}

export function isAdmin(role: Role) {
  return role === 'admin'
}

export function canEditPost(role: Role, authorId: string | null | undefined, userId: string | null) {
  if (role === 'admin') return true
  if (role === 'author') return Boolean(authorId && userId && authorId === userId)
  return false
}
