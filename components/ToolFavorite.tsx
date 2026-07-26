"use client";

/* The star in the tool hero. It lived inside ToolPageShell, and it was the
   only reason that whole 200-line shell carried "use client" — usePathname()
   is the sole hook in it. Split out, the shell renders on the server and just
   this button hydrates. */

import { usePathname } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";

export default function ToolFavorite({ title, group }: { title: string; group: string }) {
  const pathname = usePathname();
  return <FavoriteButton tool={{ href: pathname || "", title, group }} />;
}
