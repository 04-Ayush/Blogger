import { Suspense } from 'react'

import CreatePostsClientPage from './CreatePostsClient'

export default function CreatePostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      }
    >
      <CreatePostsClientPage />
    </Suspense>
  )
}
