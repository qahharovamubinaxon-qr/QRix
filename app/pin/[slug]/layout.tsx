import type { Metadata } from "next";

/* Bare layout for the PIN gate.

   Someone reaches this page by scanning a QR code — they came to open one
   link, not to browse QRix. The nav, footer and the site-wide dot canvas are
   all noise here (and the canvas runs a rAF loop on a phone camera app's
   in-app browser), so this marks the document `qx-bare` and the same rule the
   embed layout uses hides every sibling of #main. Flat black, nothing moving.

   The inline script runs before paint, so the chrome never flashes. */

export const metadata: Metadata = {
  title: "PIN Protected — QRix",
  robots: { index: false, follow: false },   // a gate is not a landing page
};

export default function PinLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add("qx-bare")` }}
      />
      {children}
    </>
  );
}
