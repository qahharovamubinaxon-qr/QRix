import type { Metadata } from "next";
import ApiKeysClient from "@/components/account/ApiKeysClient";

/* A server component wrapper so this route has its own title instead of
   inheriting the homepage's — the trap a bare "use client" page falls into.
   noindex because robots.txt already disallows /account and a key manager has
   no business in an index either way. */
export const metadata: Metadata = {
  /* No " — QRix" here: the root layout's title template already appends it, and
     spelling it out produced "API keys — QRix | QRix". */
  title: "API keys",
  description: "Create and revoke API keys for the QRix API.",
  robots: { index: false, follow: false },
};

export default function AccountApiPage() {
  return <ApiKeysClient />;
}
