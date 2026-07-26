"use client";

/* QR_TYPES entries carry a `build(values)` function, so a QrType object can
   never cross a server -> client boundary as a prop. This wrapper takes the
   id instead and does the lookup on the client, which is what lets the QR
   tool route render its page shell on the server. */

import QRGenerator from "@/components/QRGenerator";
import { QR_TYPES } from "@/lib/qr-types";

export default function QRGeneratorByType({ typeId }: { typeId: string }) {
  const type = QR_TYPES[typeId];
  if (!type) return null;
  return <QRGenerator type={type} />;
}
