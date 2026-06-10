"use client";

import { useState } from "react";

export default function CompressPdfClient() {
  const [file, setFile] =
    useState<File | null>(null);

  const [level, setLevel] =
    useState("medium");

  return (
    <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-8 max-w-xl">

      <input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] || null
          )
        }
      />

      <div className="flex gap-4 flex-wrap">

        <label
          htmlFor="pdf-upload"
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl cursor-pointer"
        >
          Choose PDF
        </label>

        <select
          value={level}
          onChange={(e) =>
            setLevel(
              e.target.value
            )
          }
          className="bg-zinc-800 text-white px-4 py-3 rounded-xl border border-zinc-700"
        >
          <option value="low">
            Low Compression
          </option>

          <option value="medium">
            Medium Compression
          </option>

          <option value="high">
            High Compression
          </option>
        </select>

        <button
          className="bg-cyan-500 text-black font-bold px-6 py-3 rounded-xl"
        >
          Compress PDF
        </button>

      </div>

      {file && (
        <div className="mt-6">

          <div className="text-cyan-400">
            📄 {file.name}
          </div>

          <div className="text-zinc-400 mt-2">
            Size:{" "}
            {(file.size / 1024 / 1024).toFixed(2)}
            {" "}
            MB
          </div>

          <div className="text-zinc-400 mt-2">
            Compression:
            {" "}
            <span className="text-cyan-400">
              {level}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}