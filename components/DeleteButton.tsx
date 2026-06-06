"use client";

type Props = {
  slug: string;
};

export default function DeleteButton({
  slug,
}: Props) {
  const handleDelete = async () => {
    const ok = confirm(
      "Delete this QR?"
    );

    if (!ok) return;

    const res = await fetch(
      "/api/create-dynamic/delete-link",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          slug,
        }),
      }
    );

    if (res.ok) {
      location.reload();
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="px-3 py-2 rounded-xl bg-red-600 text-white"
    >
      Delete
    </button>
  );
}