import { Suspense } from 'react'

import PostsClientPage from './PostsClient'

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950" />
      }
    >
      <PostsClientPage />
    </Suspense>
  )
}
