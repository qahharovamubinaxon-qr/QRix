type Props = {
  total: number;
};

export default function AnalyticsCard({
  total,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-cyan-500/20 rounded-3xl p-6">

      <h2 className="text-2xl font-bold">
        Analytics
      </h2>

      <div className="mt-5">

        <p className="text-cyan-400 text-5xl font-bold">
          {total}
        </p>

        <p className="text-gray-400">
          Total QR Generated
        </p>

      </div>

    </div>
  );
}