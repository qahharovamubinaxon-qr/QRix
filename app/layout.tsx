import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopNav from "@/components/TopNav";
import CursorGlow from "@/components/CursorGlow";
import DotDistortionBackground from "@/components/DotDistortionBackground";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, jsonLd } from "@/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "QR code generator", "free QR code", "dynamic QR code", "QR code with logo",
    "PDF tools", "merge PDF", "split PDF", "compress PDF", "PDF to Word", "PDF to JPG",
    "OCR PDF", "sign PDF", "image tools", "remove background", "WiFi QR code", "vCard QR",
  ],
  authors: [{ name: SITE_NAME }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og.png`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* theme init — runs before paint to avoid flash */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")!=="dark"){document.documentElement.classList.add("light")}}catch(e){document.documentElement.classList.add("light")}`,
          }}
        />
        {/* Organization + WebSite structured data */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={jsonLd([
            { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/og.png` },
            { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/qr-tools?q={search_term_string}`, "query-input": "required name=search_term_string" } },
          ])}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* Бутун сайт фони — barcha sahifalarda chiqadi */}
        <DotDistortionBackground />
        <CursorGlow />
        <TopNav />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
