'use client'

import { roleBadge } from '../utils/adminHelpers'
import { formatDate } from '../utils/formatters'
import type { AdminUserRow } from '../utils/types'

import AdminSectionHeader from './AdminSectionHeader'
import EmptyState from './EmptyState'

type Props = {
    loading: boolean
    users: AdminUserRow[]
}

export default function UsersTable({ loading, users }: Props) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="h-5 w-48 rounded bg-white/10" />
                <div className="mt-4 h-28 rounded-xl bg-white/5" />
            </div>
        )
    }

    if (users.length === 0) {
        return <EmptyState title="No users yet" detail="When users register, you’ll be able to manage roles and access here." />
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <AdminSectionHeader
                title="User Management"
                subtitle="Manage roles, access, and account status"
                right={
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                        {users.length} users
                    </div>
                }
            />

            <div className="mt-4 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 text-left">
                    <thead>
                        <tr className="text-xs font-semibold uppercase tracking-wider text-white/40">
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Role</th>
                            <th className="px-3 py-2">Joined</th>
                            <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const initial = u.name.trim().slice(0, 1).toUpperCase() || '•'
                            return (
                                <tr
                                    key={u.id}
                                    className="rounded-2xl border border-white/10 bg-slate-950/30 transition hover:bg-white/6"
                                >
                                    <td className="px-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/80">
                                                {initial}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-white">{u.name}</div>
                                                <div className="text-xs text-white/45">ID: {u.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="truncate text-sm text-white/70">{u.email}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <span
                                            className={['inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', roleBadge(u.role)].join(
                                                ' '
                                            )}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="text-sm text-white/70">{formatDate(u.created_at)}</div>
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="flex flex-wrap justify-end gap-2">
                                            <button
                                                type="button"
                                                className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-medium text-white/80 transition hover:bg-white/10"
                                            >
                                                Change Role
                                            </button>
                                            {/* <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-transparent px-3 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
                      >
                        View Profile
                      </button> */}
                                            <button
                                                type="button"
                                                className="inline-flex h-8 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-medium text-rose-100 transition hover:bg-rose-500/15"
                                            >
                                                Suspend
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
