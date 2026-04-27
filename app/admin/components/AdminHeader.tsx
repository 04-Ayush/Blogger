'use client'

export default function AdminHeader() {
    return (
        <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-white/70">Platform management and moderation</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Admin
            </div>
        </div>
    )
}
