"use client";

import { useState } from "react";
import jsQR from "jsqr";

export default function QRScanner() {
  const [result, setResult] = useState("");

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const img = new Image();

    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      );

      if (code) {
        setResult(code.data);
      } else {
        setResult("QR code not found");
      }
    };
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">

      <h2 className="text-2xl font-bold mb-5">
        QR Scanner
      </h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
      />

      <div className="mt-6 p-4 bg-black rounded-xl break-all">
        {result || "Upload QR image"}
      </div>

    </div>
  );
}