import type { Role } from '@/lib/auth/roles'

export function canComment(role: Role) {
  return role === 'viewer'
}

export function canDeleteComment(role: Role) {
  return role === 'admin'
}

export function canViewComments(
  role: Role,
  postAuthorId: string | null | undefined,
  currentUserId: string | null,
) {
  if (role === 'admin' || role === 'viewer') return true
  if (role === 'author') return Boolean(postAuthorId && currentUserId && postAuthorId === currentUserId)
  return false
}

