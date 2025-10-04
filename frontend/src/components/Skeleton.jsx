export function SkeletonLine({ width = '100%' }) {
  return <div className="skeleton skeleton-text" style={{ width }} />;
}

export function SkeletonCard({ lines = 4, height = 0 }) {
  return (
    <div className="card p-4">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} width={`${80 - i * 8}%`} />
        ))}
        {height > 0 && <div className="skeleton skeleton-box mt-3" style={{ height }} />}
      </div>
    </div>
  );
}
