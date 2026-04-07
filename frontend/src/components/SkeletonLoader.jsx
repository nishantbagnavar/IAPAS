/** Reusable shimmer skeleton blocks */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 ${className}`}>
      <div className="skeleton h-3 w-24 mb-4 rounded" />
      <div className="skeleton h-8 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-2.5 w-1/4 rounded" />
      </div>
      <div className="skeleton h-3 w-12 rounded" />
    </div>
  )
}

export function SkeletonChart({ height = 220 }) {
  return (
    <div className="skeleton rounded-xl w-full" style={{ height }} />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton h-7 w-56 rounded" />
        <div className="skeleton h-4 w-36 rounded" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0,1,2].map(i => <SkeletonCard key={i} />)}
      </div>
      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <div className="skeleton h-4 w-40 rounded" />
        <SkeletonChart height={180} />
      </div>
    </div>
  )
}
