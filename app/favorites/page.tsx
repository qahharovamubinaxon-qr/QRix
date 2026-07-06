import { pageMeta } from "@/lib/seo";
import { FavoritesView } from "@/components/PrefsClients";
export const metadata = pageMeta({ title: "Favorites — Your Pinned Tools", description: "Your favorite QRix tools, pinned for one-click access.", path: "/favorites", noindex: true });
export default function Page() { return <FavoritesView />; }
