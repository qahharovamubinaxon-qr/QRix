import Sidebar from "@/components/Sidebar";
import { createClient } from "@/lib/supabase-server";
import AnalyticsChart from "@/components/AnalyticsChart";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: scans } = await supabase
    .from("qr_scans")
    .select("*")
    .eq("slug", slug)
    .order("scanned_at", {
      ascending: false,
    });

  const totalScans = scans?.length || 0;

  const countries = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const country =
        scan.country || "Unknown";

      acc[country] =
        (acc[country] || 0) + 1;

      return acc;
    },
    {}
  );

  const devices = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const device =
        scan.device || "Unknown";

      acc[device] =
        (acc[device] || 0) + 1;

      return acc;
    },
    {}
  );

  const browsers = scans?.reduce(
    (acc: Record<string, number>, scan) => {
      const browser =
        scan.browser || "Unknown";

      acc[browser] =
        (acc[browser] || 0) + 1;

      return acc;
    },
    {}
  );
  const scansByDay = scans?.reduce(
  (
    acc: Record<string, number>,
    scan
  ) => {
    const day =
      new Date(scan.scanned_at)
        .toISOString()
        .split("T")[0];

    acc[day] =
      (acc[day] || 0) + 1;

    return acc;
  },
  {}
);
const chartData = Object.entries(
  scansByDay || {}
)
  .sort()
  .map(([date, scans]) => ({
    date,
    scans,
  }));

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <main className="flex-1 p-10">
        <h1 className="text-4xl font-bold">
          Analytics
        </h1>

        <p className="text-gray-400 mt-2">
          QR: {slug}
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
  <div className="bg-zinc-900 p-6 rounded-3xl">
    <h2 className="text-gray-400 text-sm">
      Total Scans
    </h2>

    <p className="text-5xl font-bold text-cyan-400 mt-3">
      {totalScans}
    </p>
  </div>

  <div className="bg-zinc-900 p-6 rounded-3xl">
    <h2 className="text-gray-400 text-sm">
      Countries
    </h2>

    <p className="text-5xl font-bold text-cyan-400 mt-3">
      {Object.keys(countries || {}).length}
    </p>
  </div>

  <div className="bg-zinc-900 p-6 rounded-3xl">
    <h2 className="text-gray-400 text-sm">
      Devices
    </h2>

    <p className="text-5xl font-bold text-cyan-400 mt-3">
      {Object.keys(devices || {}).length}
    </p>
  </div>

  <div className="bg-zinc-900 p-6 rounded-3xl">
    <h2 className="text-gray-400 text-sm">
      Browsers
    </h2>

    <p className="text-5xl font-bold text-cyan-400 mt-3">
      {Object.keys(browsers || {}).length}
    </p>
  </div>
</div>
        
        <div className="bg-zinc-900 p-6 rounded-3xl mt-8">
  <h2 className="text-2xl font-bold mb-6">
    Scan Trend
  </h2>

  <AnalyticsChart
    data={chartData}
  />
</div>
        <div className="bg-zinc-900 p-6 rounded-3xl mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Recent Scans
          </h2>

          <div className="space-y-3">
            {scans?.map((scan) => (
  <div
    key={scan.id}
    className="bg-black p-4 rounded-2xl border border-zinc-800"
  >
    <div className="grid md:grid-cols-4 gap-4">
      <div>
        <div className="text-gray-500 text-xs">
          Country
        </div>

        <div>
          {scan.country || "Unknown"}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">
          Device
        </div>

        <div>
          {scan.device}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">
          Browser
        </div>

        <div>
          {scan.browser}
        </div>
      </div>

      <div>
        <div className="text-gray-500 text-xs">
          Time
        </div>

        <div className="text-sm">
          {new Date(
            scan.scanned_at
          ).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
))}
          </div>
        </div>

      </main>
    </div>
  );
}