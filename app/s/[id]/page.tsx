import { notFound } from "next/navigation";
import { getDoc } from "@/lib/server/secure-docs";

/* The page a QR scan lands on: the document's name, four digits, one button.
   Nothing else — no account, no sign-in, no JavaScript required.

   Deliberately plain. The person holding this phone is a clerk or a patient
   opening one certificate, and every element that is not the code field is
   something between them and the document. */

export const dynamic = "force-dynamic";

export default async function SecureDocPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  /* Only the title is read here. The destination stays on the server until the
     code is right — the page never contains it. */
  const doc = await getDoc(id);
  if (!doc) notFound();

  return (
    <main
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: "#000", color: "#fff" }}
    >
      <div className="w-full max-w-[420px]">
        {doc.title && (
          <h1 className="text-[17px] font-semibold text-center mb-8 leading-snug" style={{ color: "#fff" }}>
            {doc.title}
          </h1>
        )}

        <form action={`/s/${id}/verify`} method="POST">
          <label htmlFor="code" className="block text-[14px] mb-3 text-center" style={{ color: "#b9b9b9" }}>
            Enter the 4-digit code
          </label>

          <input
            id="code" name="code" inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{4}" maxLength={4} required autoFocus
            aria-describedby={error ? "code-error" : undefined}
            className="w-full text-center rounded-lg px-4 py-4 text-[28px] tracking-[0.6em]"
            style={{
              background: "#0d0d0d",
              border: `1px solid ${error ? "#e5484d" : "#2a2a2a"}`,
              color: "#fff",
              outlineColor: "#666",
            }}
          />

          {error === "1" && (
            <p id="code-error" role="alert" className="text-[13px] mt-3 text-center" style={{ color: "#e5484d" }}>
              Wrong code.
            </p>
          )}
          {error === "rate" && (
            <p id="code-error" role="alert" className="text-[13px] mt-3 text-center" style={{ color: "#e5484d" }}>
              Too many attempts. Wait a few minutes.
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-5 rounded-lg py-3.5 text-[15px] font-semibold"
            style={{ background: "#fff", color: "#000", border: "none" }}
          >
            Open
          </button>
        </form>
      </div>
    </main>
  );
}
