/* Embed layout — marks the document as embed mode (pre-paint, no chrome flash)
   so /embed/* renders as a bare widget that any site can iframe. */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("qx-embed")` }}
      />
      <div className="qx-embed-shell">{children}</div>
    </>
  );
}
