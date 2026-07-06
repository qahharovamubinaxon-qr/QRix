"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordRecent } from "@/lib/user-prefs";

/** Mounted on tool pages — records the current route into "recently used". */
export default function RecordVisit({ title, group }: { title: string; group?: string }) {
  const pathname = usePathname();
  useEffect(() => { if (pathname) recordRecent({ href: pathname, title, group }); }, [pathname, title, group]);
  return null;
}
