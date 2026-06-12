"use client";

import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { FiDownload, FiChevronDown, FiSliders } from "react-icons/fi";

type Props = {
  value: string;
  color: string;
  bgColor: string;
  size: number;
  logo?: string;
  style?: string;
  onDownload?: () => void;
  // New design props
  outerMarker?: string;
  innerMarker?: string;
  markerColor?: string;
  frameStyle?: string;
  frameText?: string;
  dark?: boolean;
  onCustomize?: () => void;
};

export default function QRPreview({
  value,
  color,
  bgColor,
  size,
  logo,
  style,
  onDownload,
  outerMarker = "square",
  innerMarker = "square",
  markerColor,
  frameStyle = "none",
  frameText = "Scan me",
  dark = true,
  onCustomize,
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const downloadPNG = async () => {
    if (!qrRef.current) return;
    const dataUrl = await toPng(qrRef.current, { pixelRatio: 3 });
    const link = document.createElement("a");
    link.download = "qrix-qr.png";
    link.href = dataUrl;
    link.click();
    onDownload?.();
    setShowDownloadMenu(false);
  };

  const downloadSVG = () => {
    const svg = document.querySelector("#qrix-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrix-qr.svg";
    link.click();
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // Frame styles
  const getFrameStyle = () => {
    if (frameStyle === "none") return null;

    const frames: Record<string, React.ReactNode> = {
      banner: (
        <div className="w-full flex items-center justify-center py-2 mt-1 rounded-b-xl"
          style={{ background: "#1a1a2e" }}>
          <span className="text-white text-xs font-bold tracking-wider">{frameText}</span>
        </div>
      ),
      ribbon: (
        <div className="w-full flex items-center justify-center py-2 mt-1"
          style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", borderRadius: "0 0 12px 12px" }}>
          <span className="text-white text-xs font-bold tracking-wider">{frameText}</span>
        </div>
      ),
      box: (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: "3px solid #06b6d4", boxShadow: "0 0 20px rgba(6,182,212,0.4)" }} />
      ),
      phone: (
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ border: "8px solid #1a1a2e", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }} />
      ),
    };

    return frames[frameStyle] || null;
  };

  return (
    <div className="flex flex-col w-full">
      {/* QR Code area */}
      <div
        ref={qrRef}
        className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center"
        style={{ backgroundColor: bgColor, padding: 16 }}
      >
        {frameStyle === "box" || frameStyle === "phone" ? getFrameStyle() : null}

        <div className="relative flex items-center justify-center">
          <QRCodeSVG
            id="qrix-svg"
            value={value || "https://qrix.com"}
            size={size}
            fgColor={color}
            bgColor={bgColor}
          />

          {logo && (
            <img
              src={logo}
              alt="Logo"
              className="absolute bg-white p-1"
              style={{
                width: 48,
                height: 48,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderRadius: style === "rounded" ? "50%" : 10,
              }}
            />
          )}
        </div>

        {(frameStyle === "banner" || frameStyle === "ribbon") ? getFrameStyle() : null}
      </div>

      {/* Download button with dropdown */}
      <div className="relative mt-3">
        <div className="flex gap-1">
          <button
            onClick={downloadPNG}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-black transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#06b6d4,#3b82f6)", boxShadow: "0 0 15px rgba(6,182,212,0.3)" }}
          >
            <FiDownload size={13} />
            Download PNG
          </button>
          <button
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            className="px-3 py-2.5 rounded-xl text-white transition hover:opacity-80"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}
          >
            <FiChevronDown size={14} className={`transition-transform ${showDownloadMenu ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showDownloadMenu && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
            style={{ background: dark ? "#0f0f1e" : "white", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
          >
            <button onClick={downloadPNG}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition ${dark ? "text-zinc-300 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-50"}`}>
              <FiDownload size={12} /> Download PNG
            </button>
            <button onClick={downloadSVG}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition ${dark ? "text-zinc-300 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-50"}`}>
              <FiDownload size={12} /> Download SVG
            </button>
          </div>
        )}
      </div>

      {/* Customize Design button */}
      {onCustomize && (
        <button
          onClick={onCustomize}
          className="mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition hover:opacity-80"
          style={{
            background: dark ? "rgba(168,85,247,0.08)" : "rgba(168,85,247,0.06)",
            border: "1px solid rgba(168,85,247,0.25)",
            color: "#a855f7",
            boxShadow: "0 0 12px rgba(168,85,247,0.1)",
          }}
        >
          <FiSliders size={13} />
          Customize Design
        </button>
      )}
    </div>
  );
}
