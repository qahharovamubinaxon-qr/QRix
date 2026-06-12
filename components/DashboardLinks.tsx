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
      <table className="qx-table">
        <thead>
          <tr>
            <th>Slug</th>
            <th>URL</th>
            <th>Scans</th>
            <th>PIN</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {links.map((item) => (
            <tr key={item.id ?? item.slug}>
              <td>{item.slug}</td>

              <td className="max-w-sm truncate">{item.target_url}</td>

              <td>
                <span className="qx-badge">{item.scans}</span>
              </td>

              <td>
                {item.pin ? (
                  <span className="qx-badge-success qx-badge">🔒 {item.pin}</span>
                ) : (
                  <span style={{ color: "var(--text-faint)" }}>—</span>
                )}
              </td>

              <td>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={(event) => handleEdit(event, item)}
                    className="qx-btn-ghost !px-3 !py-1.5 !text-xs"
                  >
                    ✏️ Edit
                  </button>

                  <a
                    href={`/dashboard/analytics/${item.slug}`}
                    className="qx-btn !px-3 !py-1.5 !text-xs"
                  >
                    📊 Analytics
                  </a>

                  <DeleteButton slug={item.slug} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
