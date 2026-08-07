import type { Metadata } from "next";

/* Bare layout for the document gate.

   Somebody reaches this page by scanning a QR code on a printed form. They came
   to open one document, not to meet QRix: the nav, the sign-up button, the
   language switcher, the cookie banner and the dot canvas are all noise, and on
   a phone they push the code field below the fold. `qx-bare` is the same rule
   the PIN gate uses — it hides every sibling of #main and forces flat black.

   The inline script runs before paint, so the chrome never flashes first. */

export const metadata: Metadata = {
  // the root layout's template already appends " | QRix"
  title: "Enter code",
  robots: { index: false, follow: false },
};

export default function SecureDocLayout({ children }: { children: React.ReactNode }) {
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
