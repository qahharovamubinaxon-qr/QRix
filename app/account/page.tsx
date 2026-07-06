import { pageMeta } from "@/lib/seo";
import { AccountView } from "@/components/PrefsClients";
export const metadata = pageMeta({ title: "Account — Profile & Achievements", description: "Your QRix profile, usage statistics and achievements.", path: "/account", noindex: true });
export default function Page() { return <AccountView />; }
