import { pageMeta } from "@/lib/seo";
import { HistoryView } from "@/components/PrefsClients";
export const metadata = pageMeta({ title: "History — Your Recent Files", description: "Your recent downloads and processed files on QRix.", path: "/history", noindex: true });
export default function Page() { return <HistoryView />; }
