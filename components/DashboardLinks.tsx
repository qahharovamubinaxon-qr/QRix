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
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-zinc-700 text-left">
          <th className="pb-4">Slug</th>
          <th className="pb-4">URL</th>
          <th className="pb-4">Scans</th>
          <th className="pb-4">PIN</th>
          <th className="pb-4">Actions</th>
        </tr>
      </thead>

      <tbody>
        {links.map((item) => (
          <tr
            key={item.id ?? item.slug}
            className="border-b border-zinc-800"
          >
            <td className="py-4 font-semibold">
              {item.slug}
            </td>

            <td className="py-4 text-gray-400 max-w-sm truncate">
              {item.target_url}
            </td>

            <td className="py-4">
              {item.scans}
            </td>

            <td className="py-4">
              {item.pin || "-"}
            </td>

            <td className="py-4">
              <div className="flex gap-2 flex-wrap">

                <button
                  onClick={(event) =>
                    handleEdit(event, item)
                  }
                  className="px-3 py-2 rounded-lg bg-cyan-500 text-black text-sm font-semibold"
                >
                  Edit
                </button>

                <a
                  href={`/dashboard/analytics/${item.slug}`}
                  className="px-3 py-2 rounded-lg bg-green-500 text-black text-sm font-semibold"
                >
                  Analytics
                </a>

                <DeleteButton
                  slug={item.slug}
                />

              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
);
}