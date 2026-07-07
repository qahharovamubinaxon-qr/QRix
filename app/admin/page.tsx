import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = pageMeta({
  title: "Admin",
  description: "QRix admin dashboard.",
  path: "/admin",
  noindex: true,
});

export default function AdminPage() {
  return <AdminPanel />;
}
