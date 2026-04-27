'use client'

type Props = {
    deletePostDialogId: string | null
    deletePostDialogVisible: boolean
    deletingPostId: string | null
    closeDeletePostDialogAction: () => void
    performDeletePostAction: (id: string) => Promise<void>
}

export default function DeletePostDialog({
    deletePostDialogId,
    deletePostDialogVisible,
    deletingPostId,
    closeDeletePostDialogAction,
    performDeletePostAction,
}: Props) {
    if (!deletePostDialogId) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Delete post confirmation"
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        >
            <button
                type="button"
                aria-label="Close"
                onClick={() => {
                    closeDeletePostDialogAction()
                }}
                className={[
                    'absolute inset-0 bg-black/60 transition-opacity duration-150 ease-out',
                    deletePostDialogVisible ? 'opacity-100' : 'opacity-0',
                    'motion-reduce:transition-none',
                ].join(' ')}
            />

            <div
                className={[
                    'relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-5 backdrop-blur',
                    'transform-gpu transition-[transform,opacity] duration-150 ease-out will-change-transform',
                    deletePostDialogVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
                    'motion-reduce:transition-none motion-reduce:transform-none',
                ].join(' ')}
            >
                <h2 className="text-base font-semibold tracking-tight text-white">Delete this post?</h2>
                <p className="mt-2 text-sm leading-6 text-white/70">This action cannot be undone.</p>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        disabled={Boolean(deletingPostId)}
                        onClick={() => closeDeletePostDialogAction()}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={Boolean(deletingPostId)}
                        onClick={() => void performDeletePostAction(deletePostDialogId)}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {deletingPostId ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    )
}
