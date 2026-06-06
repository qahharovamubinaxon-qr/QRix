"use client";

import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { useRef } from "react";

type Props = {
  value: string;
  color: string;
  bgColor: string;
  size: number;
  logo?: string;
  style?: string;
  onDownload?: () => void;
};

export default function QRPreview({
  value,
  color,
  bgColor,
  size,
  logo,
  style,
  onDownload,
}: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadPNG = async () => {
    if (!qrRef.current) return;

    const dataUrl = await toPng(qrRef.current);

    const link = document.createElement("a");

    link.download = "qrix-qr.png";
    link.href = dataUrl;
    link.click();

    onDownload?.();
  };

  const downloadSVG = () => {
    const svg = document.querySelector("#qrix-svg");

    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "qrix-qr.svg";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-black rounded-3xl p-8 border border-cyan-500/20">

      <div
        ref={qrRef}
        className="w-72 h-72 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: bgColor,
        }}
      >
        <div className="relative">

          <QRCodeSVG
            id="qrix-svg"
            value={value}
            size={size}
            fgColor={color}
            bgColor={bgColor}
          />

          {logo && (
            <img
              src={logo}
              alt="Logo"
              className={`absolute top-1/2 left-1/2 bg-white p-1 ${
                style === "rounded"
                  ? "rounded-full"
                  : "rounded-xl"
              }`}
              style={{
                width: 56,
                height: 56,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}

        </div>
      </div>

      <button
        onClick={downloadPNG}
        className="mt-5 w-full h-12 rounded-xl bg-cyan-500 text-black font-semibold"
      >
        Download PNG
      </button>

      <button
        onClick={downloadSVG}
        className="mt-3 w-full h-12 rounded-xl border border-cyan-500/20"
      >
        Download SVG
      </button>

    </div>
  );
}