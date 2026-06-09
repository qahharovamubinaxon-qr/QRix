"use client";

import { useState } from "react";

export default function MergePdfPage() {
  const [files, setFiles] =
    useState<FileList | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleMerge() {
    if (!files || files.length < 2) {
      alert(
        "At least 2 PDF files required"
      );
      return;
    }

    setLoading(true);

    const formData =
      new FormData();

    Array.from(files).forEach(
      (file) => {
        formData.append(
          "files",
          file
        );
      }
    );

    const response =
      await fetch(
        "/api/pdf/merge",
        {
          method: "POST",
          body: formData,
        }
      );

    if (!response.ok) {
      alert("Merge failed");
      setLoading(false);
      return;
    }

    const blob =
      await response.blob();

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "merged.pdf";

    a.click();

    window.URL.revokeObjectURL(
      url
    );

    setLoading(false);
  }

  return (
    <div className="p-10 text-white">

      <h1 className="text-5xl font-bold mb-8">
        Merge PDF
      </h1>

      <div className="bg-zinc-900 p-8 rounded-3xl">

        <div className="flex gap-4 items-center flex-wrap">

  <label
    className="
      bg-yellow-400
      text-black
      px-6
      py-3
      rounded-xl
      font-bold
      cursor-pointer
      hover:bg-yellow-300
      transition
    "
  >
    Select PDF Files

    <input
      type="file"
      accept=".pdf"
      multiple
      onChange={(e) =>
        setFiles(e.target.files)
      }
      className="hidden"
    />
  </label>

  <button
    onClick={handleMerge}
    disabled={loading}
    className="
      bg-cyan-500
      text-black
      px-6
      py-3
      rounded-xl
      font-bold
      hover:bg-cyan-400
      transition
    "
  >
    {loading
      ? "Merging..."
      : "Merge PDF"}
  </button>

</div>

{files && (
  <div className="mt-4 space-y-2">
    {Array.from(files).map((file, index) => (
      <div
        key={index}
        className="
          bg-black
          rounded-lg
          px-4
          py-2
          text-green-400
        "
      >
        ✓ {file.name}
      </div>
    ))}
  </div>
)}

{files && (
  <p className="mt-4 text-green-400">
    ✓ {files.length} files selected
  </p>
)}

      </div>

    </div>
  );
}