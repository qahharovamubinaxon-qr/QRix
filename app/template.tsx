/** Soft fade+rise on every route change — premium page transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="qx-page-in">{children}</div>;
}
