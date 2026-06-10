import Link from "next/link";
import {
  FiFileText, FiScissors, FiImage,
  FiFile, FiType, FiDownload, FiMinimize2, FiChevronRight,
} from "react-icons/fi";

const tools = [
  {
    href: "/pdf-tools/merge",
    icon: <FiFileText size={24} />,
    title: "Merge PDF",
    description: "Combine multiple PDFs into one file",
    gradient: "from-blue-600 to-blue-800",
    glow: "hover:shadow-blue-500/25",
  },
  {
    href: "/pdf-tools/split",
    icon: <FiScissors size={24} />,
    title: "Split PDF",
    description: "Split PDF into separate pages or ranges",
    gradient: "from-violet-600 to-violet-800",
    glow: "hover:shadow-violet-500/25",
  },
  {
    href: "/pdf-tools/pdf-to-jpg",
    icon: <FiImage size={24} />,
    title: "PDF to JPG",
    description: "Convert PDF pages to high-quality images",
    gradient: "from-emerald-600 to-emerald-800",
    glow: "hover:shadow-emerald-500/25",
  },
  {
    href: "/pdf-tools/jpg-to-pdf",
    icon: <FiFile size={24} />,
    title: "JPG to PDF",
    description: "Convert images to PDF document",
    gradient: "from-orange-600 to-orange-800",
    glow: "hover:shadow-orange-500/25",
  },
  {
    href: "/pdf-tools/pdf-to-word",
    icon: <FiType size={24} />,
    title: "PDF to Word",
    description: "Convert PDF to editable Word document",
    gradient: "from-cyan-600 to-cyan-800",
    glow: "hover:shadow-cyan-500/25",
  },
  {
    href: "/pdf-tools/word-to-pdf",
    icon: <FiDownload size={24} />,
    title: "Word to PDF",
    description: "Convert Word documents to PDF format",
    gradient: "from-pink-600 to-pink-800",
    glow: "hover:shadow-pink-500/25",
  },
  {
    href: "/pdf-tools/compress",
    icon: <FiMinimize2 size={24} />,
    title: "Compress PDF",
    description: "Reduce PDF file size while keeping quality",
    gradient: "from-yellow-600 to-yellow-800",
    glow: "hover:shadow-yellow-500/25",
  },
];

export default function PdfToolsPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(ellipse at top, #0f172a 0%, #020617 60%, #000000 100%)",
      }}
    >
      {/* ✅ Top Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm bg-black/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-black text-sm group-hover:bg-cyan-400 transition">
              Q
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-cyan-400 transition">
              QRix
            </span>
          </Link>

          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white">PDF Tools</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm mb-6">
            <FiFileText size={14} />
            PDF Tools
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Work with PDFs
            <span className="text-cyan-400"> easily</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Everything you need to manage PDF files — merge, split, convert, and compress
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`
                group relative overflow-hidden
                rounded-2xl p-6
                bg-zinc-900/60 backdrop-blur
                border border-white/5
                hover:border-white/10
                hover:shadow-2xl ${tool.glow}
                transition-all duration-300
                hover:-translate-y-1
              `}
            >
              {/* Gradient glow background */}
              <div
                className={`
                  absolute inset-0 opacity-0 group-hover:opacity-10
                  bg-gradient-to-br ${tool.gradient}
                  transition-opacity duration-300
                `}
              />

              {/* Icon */}
              <div
                className={`
                  relative w-11 h-11 rounded-xl mb-5
                  bg-gradient-to-br ${tool.gradient}
                  flex items-center justify-center text-white
                  shadow-lg
                  group-hover:scale-110 transition-transform duration-300
                `}
              >
                {tool.icon}
              </div>

              {/* Text */}
              <div className="relative">
                <h2 className="text-white font-bold text-base mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {tool.description}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute top-5 right-5 text-zinc-700 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-300">
                <FiChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}