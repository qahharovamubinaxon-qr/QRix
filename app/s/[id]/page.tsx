import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getDoc, unlockValid, COOKIE } from "@/lib/server/secure-docs";

/* The page a QR scan lands on: ask for the four-digit code, then show the
   document. No account, no sign-in, nothing to install.

   Never indexable — these are one-off documents about named people, and the
   title alone would be a leak. */
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Enter code" };
export const dynamic = "force-dynamic";

export default async function SecureDocPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const doc = await getDoc(id);
  if (!doc) notFound();

  const unlocked = await unlockValid(id, (await cookies()).get(COOKIE(id))?.value);

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[520px]">
        {doc.title && (
          <h1 className="font-display font-bold text-[19px] mb-5 text-center" style={{ color: "var(--text)" }}>
            {doc.title}
          </h1>
        )}

        {unlocked ? (
          <figure className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
            {/* The bytes come from /s/<id>/image, which is this server reading the
                destination and streaming it. The destination itself never appears
                in the markup, the address bar, history or the Referer — if it did,
                the code would be decoration. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/s/${id}/image`} alt={doc.title || "Document"} style={{ display: "block", width: "100%", height: "auto" }} />
          </figure>
        ) : (
          <form action={`/s/${id}/verify`} method="POST"
            className="rounded-2xl p-6" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
            <label htmlFor="code" className="block font-bold text-[15px] mb-1" style={{ color: "var(--text)" }}>
              Enter the 4-digit code
            </label>
            <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
              It is printed at the bottom of the document.
            </p>

            <input
              id="code" name="code" inputMode="numeric" autoComplete="one-time-code"
              pattern="[0-9]{4}" maxLength={4} required autoFocus aria-describedby={error ? "code-error" : undefined}
              className="w-full text-center qx-mono rounded-xl px-4 py-3 text-[24px] tracking-[0.5em]"
              style={{ background: "var(--surface-2)", border: `1px solid ${error ? "var(--danger)" : "var(--border)"}`, color: "var(--text)" }}
            />

            {error === "1" && (
              <p id="code-error" role="alert" className="text-[13px] mt-3" style={{ color: "var(--danger)" }}>
                Wrong code. Check the number printed on the document.
              </p>
            )}
            {error === "rate" && (
              <p id="code-error" role="alert" className="text-[13px] mt-3" style={{ color: "var(--danger)" }}>
                Too many attempts. Wait a few minutes and try again.
              </p>
            )}

            <button type="submit" className="qx-btn w-full justify-center mt-5">Open</button>
          </form>
        )}
      </div>
    </main>
  );
}
