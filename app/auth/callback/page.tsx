import type { Metadata } from "next";
import CallbackClient from "./CallbackClient";

export const metadata: Metadata = {
  title: "Signing you in… — QRix",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return <CallbackClient />;
}
