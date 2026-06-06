"use client";

"use client";

import type { MouseEvent } from "react";
import DeleteButton from "@/components/DeleteButton";

type LinkItem = {
  id?: string | number;
  slug: string;
  target_url: string;
  scans: number;
  pin?: string | null;
};

type DashboardLinksProps = {
  links: LinkItem[];
};

export default function DashboardLinks({ links }: DashboardLinksProps) {
  const handleEdit = async (
    event: MouseEvent<HTMLButtonElement>,
    item: LinkItem
  ) => {
    event.preventDefault();

    const newUrl = prompt("New URL", item.target_url);
    if (!newUrl) return;

    await fetch("/api/create-dynamic/update-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: item.slug,
        target_url: newUrl,
      }),
    });

    location.reload();
  };

  return (
    <div className="space-y-3">
      {links.map((item) => (
        <div
          key={item.id ?? item.slug}
          className="grid gap-2 p-4 bg-black rounded-xl"
        >
          <div className="text-white font-semibold">{item.slug}</div>
          <div className="text-gray-400 break-words">{item.target_url}</div>
          <div className="text-gray-400">Scans: {item.scans}</div>
          <div className="text-gray-400">
            PIN: {item.pin ? item.pin : "No PIN"}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={(event) => handleEdit(event, item)}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2 text-black font-semibold"
            >
              Edit URL
            </button>
            <DeleteButton slug={item.slug} />
          </div>
        </div>
      ))}
    </div>
  );
}
