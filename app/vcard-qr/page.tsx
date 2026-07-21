import { permanentRedirect } from "next/navigation";

/* Early stub with no generator on it — see app/url-qr/page.tsx. The real vCard
   tool is /qr-tools/vcard; a 308 keeps this URL alive and points both visitors
   and crawlers at it. */
export default function VCardQrPage() {
  permanentRedirect("/qr-tools/vcard");
}
