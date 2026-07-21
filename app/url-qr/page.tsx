import { permanentRedirect } from "next/navigation";

/* This was an early stub — a heading and one sentence, no generator — and Yandex
   had it indexed, so visitors landed on a page that does nothing. The real tool
   lives at /qr-tools/url. A 308 keeps this URL working, sends people to the
   working generator and consolidates its ranking signals onto the real page. */
export default function UrlQrPage() {
  permanentRedirect("/qr-tools/url");
}
