import { pageMeta } from "@/lib/seo";
import { SettingsView } from "@/components/PrefsClients";
export const metadata = pageMeta({ title: "Settings", description: "Personalize your QRix experience — theme, language, animations and privacy.", path: "/settings", noindex: true });
export default function Page() { return <SettingsView />; }
