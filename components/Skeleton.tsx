/* Shimmer skeleton primitives. Pure CSS, no deps. */
export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={`qx-skel ${className}`} style={style} aria-hidden />;
}
export function SkeletonCard() {
  return (
    <div className="qx-card p-5" aria-hidden>
      <Skeleton className="block" style={{ width: 44, height: 44, borderRadius: 12 }} />
      <Skeleton className="block mt-4" style={{ width: "70%", height: 14, borderRadius: 6 }} />
      <Skeleton className="block mt-2.5" style={{ width: "90%", height: 10, borderRadius: 5 }} />
      <Skeleton className="block mt-1.5" style={{ width: "55%", height: 10, borderRadius: 5 }} />
    </div>
  );
}
