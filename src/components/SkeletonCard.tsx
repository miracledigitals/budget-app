export function SkeletonCard({ height = 100 }: { height?: number }) {
  return (
    <div className="skeleton-card skeleton" style={{ height }} aria-label="loading" />
  )
}
