import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopNav from "@/components/TopNav";
import CursorGlow from "@/components/CursorGlow";
import DotDistortionBackground from "@/components/DotDistortionBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QRix - QR Code Generator",
  description:
    "Create QR Codes, PDF Tools and Image Tools in one platform.",
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
      </head>
      <body className="min-h-full flex flex-col">
        {/* Бутун сайт фони — barcha sahifalarda chiqadi */}
        <DotDistortionBackground />
        <CursorGlow />
        <TopNav />
        {children}
      </body>
    </html>
  );
}
