"use client";

import { getBaseUrl } from "@/lib/site-url";

type Props = {
  slug: string;
};

export default function CopyButton({
  slug,
}: Props) {
  const copyLink = async () => {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/r/${slug}`;

    await navigator.clipboard.writeText(
      url
    );

    alert("Link copied");
  };

  return (
    <button
      onClick={copyLink}
      className="px-3 py-2 rounded-xl bg-cyan-500 text-black"
    >
      Copy Link
    </button>
  );
}