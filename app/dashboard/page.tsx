import Sidebar from "../../components/Sidebar";
import DashboardLinks from "@/components/DashboardLinks";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import { createClient } from "@/lib/supabase-server";
import DashboardChart from "@/components/DashboardChart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
  return (
  <pre style={{ color: "white", padding: "20px" }}>
    {JSON.stringify(
      await supabase.auth.getUser(),
      null,
      2
    )}
  </pre>
);
}

  const userId = session.user.id;

  const { data: links } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  const totalLinks = links?.length || 0;

  const totalScans =
  links?.reduce(
    (sum, item) => sum + item.scans,
    0
  ) || 0;

  const mostPopular =
  links?.reduce(
    (best, current) =>
      !best || current.scans > best.scans
        ? current
        : best,
    null as any
  ) || null;
  
  const {
  data: recentScans,
  error: scansError,
} = await supabase
  .from("qr_scans")
  .select("*")
  .order("scanned_at", {
    ascending: false,
  })
  .limit(10);

const protectedLinks =
  links?.filter(
    (item) => item.pin
  ).length || 0;

const countriesCount =
  new Set(
    recentScans
      ?.map((scan) => scan.country)
      .filter(Boolean)
  ).size || 0;

  const chartData =
  Object.entries(
    recentScans?.reduce(
      (
        acc: Record<string, number>,
        scan
      ) => {
        const day = new Date(
          scan.scanned_at
        )
          .toISOString()
          .split("T")[0];

        acc[day] =
          (acc[day] || 0) + 1;

        return acc;
      },
      {}
    ) || {}
  )
    .sort()
    .map(([date, scans]) => ({
      date,
      scans,
    }));

console.log(
  "SCANS ERROR:",
  scansError
);

  return (
    <div className="flex min-h-screen bg-black text-white">

      <Sidebar />

      <main className="flex-1 p-10">

        <h1 className="text-5xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-400 mt-3">
          Welcome to QRix Control Center
        </p>

        {mostPopular && (
  <div className="mt-6 bg-zinc-900 border border-cyan-500/20 rounded-3xl p-6">
    <div className="text-gray-400 text-sm">
      Most Popular QR
    </div>

    <div className="text-2xl font-bold mt-2">
      {mostPopular.slug}
    </div>

    <div className="text-cyan-400 mt-1">
      {mostPopular.scans} scans
    </div>
  </div>
)}

        <div className="grid md:grid-cols-4 gap-6 mt-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h3 className="text-cyan-400 text-4xl font-bold">
              {totalLinks}
            </h3>

            <p className="text-gray-400 mt-2">
             Total QR
            </p>
          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
  <h3 className="text-cyan-400 text-4xl font-bold">
    {totalScans}
  </h3>

  <p className="text-gray-400 mt-2">
    Total Scans
  </p>
</div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
  <h3 className="text-cyan-400 text-4xl font-bold">
    {protectedLinks}
  </h3>

  <p className="text-gray-400 mt-2">
    Protected QR
  </p>
</div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
  <h3 className="text-cyan-400 text-4xl font-bold">
    {countriesCount}
  </h3>

  <p className="text-gray-400 mt-2">
    Countries
  </p>
</div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-10">

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">
              {links?.slice(0, 5).map((item) => (
                <div
                  key={item.id ?? item.slug}
                  className="p-3 bg-black rounded-xl"
                >
                  <span>{item.slug}</span>
                  <span>{" • "}</span>
                  <span>{item.scans}</span>
                  <span>{" scans"}</span>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <CopyButton slug={item.slug} />
                    <DeleteButton slug={item.slug} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold mb-4">
              Quick Tools
            </h2>

            <div className="grid grid-cols-2 gap-3">

  <a
    href="/url-qr"
    className="bg-black rounded-xl p-4 hover:bg-zinc-800 transition"
  >
    URL QR
  </a>

  <a
    href="/wifi-qr"
    className="bg-black rounded-xl p-4 hover:bg-zinc-800 transition"
  >
    WiFi QR
  </a>

  <a
    href="/pdf-tools"
    className="bg-black rounded-xl p-4 hover:bg-zinc-800 transition"
  >
    PDF Tools
  </a>

  <a
    href="/image-tools"
    className="bg-black rounded-xl p-4 hover:bg-zinc-800 transition"
  >
    Image Tools
  </a>

</div>

          </div>

        </div>
      
      <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20 mt-6">
  <h2 className="text-2xl font-bold mb-6">
    Scan Trend
  </h2>

  <DashboardChart
    data={chartData}
  />
</div>

<div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20 mt-6">

  <h2 className="text-2xl font-bold mb-4">
    Recent Scans
  </h2>

  <div className="overflow-x-auto">

    <table className="w-full">

      <thead>
        <tr className="text-left border-b border-zinc-700">
          <th className="pb-3">Slug</th>
          <th className="pb-3">Country</th>
          <th className="pb-3">Device</th>
          <th className="pb-3">Browser</th>
        </tr>
      </thead>

      <tbody>

        {recentScans?.map((scan) => (
          <tr
            key={scan.id}
            className="border-b border-zinc-800"
          >
            <td className="py-3">
              {scan.slug}
            </td>

            <td className="py-3">
              {scan.country || "-"}
            </td>

            <td className="py-3">
              {scan.device || "-"}
            </td>

            <td className="py-3">
              {scan.browser || "-"}
            </td>
          </tr>
        ))}

      </tbody>

    </table>

  </div>

</div>
        <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500/20 mt-6">
          <h2 className="text-2xl font-bold mb-4">
            Dynamic QR Links
          </h2>

          <DashboardLinks links={links || []} />
        </div>

      </main>

    </div>
  );
}