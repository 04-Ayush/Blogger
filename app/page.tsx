import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
              B
            </div>
            <span className="text-lg font-semibold tracking-wide">
              Blogger
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#overview" className="hover:text-white transition">
              Overview
            </a>
            <a href="#roles" className="hover:text-white transition">
              Roles
            </a>
            <a href="#posts" className="hover:text-white transition">
              Posts
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid min-h-[85vh] max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
              AI Powered Blogging Platform
            </div>

            <h1 className="mt-8 text-5xl font-bold leading-tight md:text-6xl">
              Write, Share &
              <span className="block text-emerald-400">
                Discover Stories
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
              A modern blogging platform where readers explore content,
              authors publish ideas, and AI generates smart summaries for every
              post.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Start Writing
              </Link>

              <Link
                href="/posts"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
              >
                Explore Posts
              </Link>
            </div>
          </div>

          {/* Hero Preview */}
          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                <div className="h-52 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20" />

                <div className="mt-5">
                  <div className="text-xl font-semibold">
                    Building Better Digital Products
                  </div>

                  <div className="mt-2 text-sm text-white/60">
                    by Alex Johnson
                  </div>

                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-xs uppercase tracking-widest text-emerald-300">
                      AI Summary
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/75">
                      This article explains how thoughtful UX design and
                      scalable architecture create modern products users enjoy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -right-8 top-12 hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg lg:block">
              <div className="text-sm text-white/70">Total Posts</div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">
                1.2K+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section id="overview" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Platform Overview
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Everything You Need For Blogging
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-white/60">
            Publish articles, discover ideas, and interact through comments —
            all powered by a clean role-based workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Create Posts',
              desc: 'Authors can write and publish rich blog content.',
            },
            {
              title: 'AI Summaries',
              desc: 'Each post includes an automatic AI-generated summary.',
            },
            {
              title: 'Role Access',
              desc: 'Different permissions for viewers, authors, and admins.',
            },
            {
              title: 'Comment System',
              desc: 'Readers can engage and interact through comments.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                ✦
              </div>

              <h3 className="text-lg font-semibold">{item.title}</h3>

              <p className="mt-3 text-sm leading-6 text-white/60">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Roles
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Built Around Permissions
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {[
            {
              role: 'Viewer',
              color: 'text-cyan-300',
              points: ['Read posts', 'Comment on blogs', 'Explore content'],
            },
            {
              role: 'Author',
              color: 'text-emerald-300',
              points: ['Create posts', 'Edit own posts', 'View comments'],
            },
            {
              role: 'Admin',
              color: 'text-orange-300',
              points: ['Manage content', 'Delete comments', 'Platform control'],
            },
          ].map((item) => (
            <div
              key={item.role}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.role}
              </div>

              <ul className="mt-6 space-y-4 text-white/65">
                {item.points.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <span className="text-emerald-400">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Posts Preview */}
      <section id="posts" className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              Latest Content
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Discover Trending Posts
            </h2>
          </div>

          <Link
            href="/posts"
            className="hidden rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 transition hover:bg-white/10 md:block"
          >
            View All Posts
          </Link>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="h-52 bg-gradient-to-br from-slate-800 to-slate-700" />

              <div className="p-6">
                <div className="text-lg font-semibold">
                  Modern Design Patterns
                </div>

                <div className="mt-2 text-sm text-white/50">
                  By Author • 5 min read
                </div>

                <p className="mt-4 text-sm leading-6 text-white/60">
                  Explore how modern interfaces combine usability, design, and
                  clean structure for better experiences.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-bold">
            Ready To Start Publishing?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-white/60">
            Join the platform and begin writing, sharing, and exploring stories
            powered by AI summaries.
          </p>

          <div className="mt-8">
            <Link
              href="/register"
              className="rounded-2xl bg-emerald-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-white/40 md:flex-row">
          <div>© 2026 Blogger Platform</div>

          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white transition">
              Login
            </Link>

            <Link href="/register" className="hover:text-white transition">
              Register
            </Link>

            <Link href="/posts" className="hover:text-white transition">
              Posts
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}