"use client";

/* The generator embedded at the bottom of /qr-code-statistics.
 *
 * It exists because QR_TYPES entries carry a `build(values)` function, and a
 * function cannot be handed from a Server Component to a Client Component —
 * the build fails on it. Every other embed of QRGenerator resolves the type on
 * the client for the same reason (see app/qr-tools/[slug]/QRToolClient.tsx);
 * this page needs one type, so the lookup is inlined rather than passed. */

import QRGenerator from "@/components/QRGenerator";
import { QR_TYPES } from "@/lib/qr-types";

export default function StatsQrTool() {
  return <QRGenerator type={QR_TYPES.url} />;
}
