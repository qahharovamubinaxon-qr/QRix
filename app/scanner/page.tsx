import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import QRScanner from "../../components/QRScanner";

/* Had no metadata at all, so it inherited the homepage title and canonical and
   could not rank — despite being a real tool Yandex had already indexed. */
export const metadata: Metadata = pageMeta({
  title: "QR Code Scanner — Read a QR Code with Your Camera, Free",
  description:
    "Scan any QR code with your phone or laptop camera and see where it leads before you open it. Free, no app to install, and nothing is uploaded — the camera feed stays on your device.",
  path: "/scanner",
  keywords: [
    "qr code scanner", "scan qr code online", "qr reader camera", "read qr code",
    "qr scanner no app", "scan qr code with laptop", "online qr reader free",
  ],
});

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        QR Scanner
      </h1>

      <QRScanner />

    </main>
  );
}
