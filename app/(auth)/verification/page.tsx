import Link from 'next/link'

export default function VerificationPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
                <div className="mx-auto w-full max-w-md">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur">
                        <div className="text-center">
                            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                                    <path
                                        d="M4.5 7.5h15v10a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-10Z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="m5.5 8.5 6.5 5 6.5-5"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">Please check your email</h2>
                            <p className="mt-2 text-sm leading-6 text-white/70">
                                We&apos;ve sent you a verification link. Open it to confirm your account.
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="text-sm font-medium text-white/80">Didn&apos;t see it?</div>
                                <ul className="mt-2 space-y-1 text-sm leading-6 text-white/60">
                                    <li>• Check your spam/junk folder.</li>
                                    <li>• Wait a minute and refresh your inbox.</li>
                                    <li>• Make sure you used the correct email address.</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Link
                                    href="/login"
                                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 active:translate-y-px"
                                >
                                    Go to Login
                                </Link>

                                <Link
                                    href="/register"
                                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/85 transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
                                >
                                    Back to Register
                                </Link>
                            </div>

                            <p className="pt-2 text-center text-xs text-white/45">
                                After verifying, you can sign in normally.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

