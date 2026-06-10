import CompressPdfClient from "@/components/CompressPdfClient";
import Link from "next/link";
import { FiChevronRight, FiMinimize2, FiZap, FiShield, FiSmartphone, FiMail, FiPrinter } from "react-icons/fi";

const steps = [
  {
    number: "01",
    title: "Select your PDF",
    description: "Click 'Select PDF' and choose the file you want to compress from your device.",
  },
  {
    number: "02",
    title: "Choose compression level",
    description: "Pick Low, Medium, or High compression based on how small you need the file.",
  },
  {
    number: "03",
    title: "Download compressed file",
    description: "Click 'Compress PDF' and your optimized file will download automatically.",
  },
];

const features = [
  {
    icon: <FiZap size={20} />,
    title: "Fast compression",
    description: "Compress large PDF files in seconds without waiting.",
  },
  {
    icon: <FiShield size={20} />,
    title: "Secure & private",
    description: "Your files are processed locally and never stored on our servers.",
  },
  {
    icon: <FiSmartphone size={20} />,
    title: "Works everywhere",
    description: "Share compressed PDFs easily via email, messaging apps, or cloud storage.",
  },
];

const useCases = [
  {
    icon: <FiMail size={18} />,
    title: "Email attachments",
    text: "Many email providers limit attachments to 10–25 MB. Compress your PDF to send it without issues.",
  },
  {
    icon: <FiSmartphone size={18} />,
    title: "Messaging apps",
    text: "WhatsApp, Telegram and similar apps have file size limits. Compressed PDFs send faster.",
  },
  {
    icon: <FiPrinter size={18} />,
    title: "Web & uploads",
    text: "Websites and portals often require small file sizes. Compress before uploading to any portal.",
  },
];

export default function CompressPdfPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(ellipse at top, #0f172a 0%, #020617 60%, #000000 100%)",
      }}
    >
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm bg-black/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-black text-sm group-hover:bg-cyan-400 transition">
              Q
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-cyan-400 transition">
              QRix
            </span>
          </Link>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight size={14} />
            <Link href="/pdf-tools" className="hover:text-white transition">PDF Tools</Link>
            <FiChevronRight size={14} />
            <span className="text-white">Compress PDF</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 text-yellow-400 text-sm mb-6">
            <FiMinimize2 size={14} />
            PDF Compressor
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Compress PDF
            <span className="text-yellow-400"> instantly</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Reduce your PDF file size without losing quality. Perfect for email, messaging, and web uploads.
          </p>
        </div>

        {/* Tool */}
        <div className="flex justify-center mb-20">
          <CompressPdfClient />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-20">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 mb-4">
                {f.icon}
              </div>
              <h3 className="text-white font-bold mb-2">{f.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* How to use */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">How to compress a PDF</h2>
            <p className="text-zinc-500">Three simple steps to reduce your file size</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative bg-zinc-900/60 border border-white/5 rounded-2xl p-6"
              >
                <div className="text-5xl font-black text-white/5 absolute top-4 right-5 select-none">
                  {step.number}
                </div>
                <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center text-black font-black text-sm mb-4">
                  {step.number}
                </div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compression levels */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">Compression levels</h2>
            <p className="text-zinc-500">Choose the right level for your needs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                level: "Low",
                color: "text-green-400",
                border: "border-green-500/20",
                bg: "bg-green-500/5",
                icon: "🟢",
                reduction: "~20–35%",
                best: "Documents with high-quality images",
                desc: "Slight reduction with excellent visual quality preserved.",
              },
              {
                level: "Medium",
                color: "text-yellow-400",
                border: "border-yellow-500/20",
                bg: "bg-yellow-500/5",
                icon: "🟡",
                reduction: "~40–60%",
                best: "Reports, presentations, forms",
                desc: "Balanced compression. Great for most everyday use cases.",
              },
              {
                level: "High",
                color: "text-red-400",
                border: "border-red-500/20",
                bg: "bg-red-500/5",
                icon: "🔴",
                reduction: "~60–75%",
                best: "Sharing via email or messaging",
                desc: "Maximum compression. Some quality loss but very small file size.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`${item.bg} border ${item.border} rounded-2xl p-6`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className={`font-black text-lg ${item.color}`}>{item.level}</span>
                  <span className="ml-auto text-zinc-400 text-sm font-mono">{item.reduction}</span>
                </div>
                <p className="text-white text-sm font-semibold mb-1">{item.best}</p>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">When to use PDF compression</h2>
            <p className="text-zinc-500">Common scenarios where compressing helps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {useCases.map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 flex gap-4"
              >
                <div className="w-9 h-9 shrink-0 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-3">Frequently asked questions</h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: "Does compressing a PDF reduce quality?",
                a: "It depends on the level. Low compression keeps quality almost identical. High compression reduces image quality slightly but drastically reduces file size.",
              },
              {
                q: "Is there a file size limit?",
                a: "Currently there is no strict limit, but very large files (50MB+) may take longer to process.",
              },
              {
                q: "Are my files stored on the server?",
                a: "No. Your files are processed in memory and immediately discarded. We do not store or share your documents.",
              },
              {
                q: "Why didn't my file get smaller?",
                a: "If your PDF contains mostly text with no images, there is little to compress. PDFs that are already optimized may show minimal reduction.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/pdf-tools"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
          >
            ← Back to PDF Tools
          </Link>
        </div>
      </div>
    </div>
  );
}