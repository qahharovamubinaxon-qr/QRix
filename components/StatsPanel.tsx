type Props = {
  totalQR: number;
  historyCount: number;
  favoritesCount: number;
};

export default function StatsPanel({
  totalQR,
  historyCount,
  favoritesCount,
}: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-6">

      <div className="bg-zinc-900 p-6 rounded-3xl border border-cyan-500/20">
        <p className="text-cyan-400 text-4xl font-bold">
          {totalQR}
        </p>

        <p className="text-gray-400 mt-2">
          Total QR
        </p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl border border-cyan-500/20">
        <p className="text-cyan-400 text-4xl font-bold">
          {historyCount}
        </p>

        <p className="text-gray-400 mt-2">
          History
        </p>
      </div>

      <div className="bg-zinc-900 p-6 rounded-3xl border border-cyan-500/20">
        <p className="text-cyan-400 text-4xl font-bold">
          {favoritesCount}
        </p>

        <p className="text-gray-400 mt-2">
          Favorites
        </p>
      </div>

    </div>
  );
}