type Props = {
  history: string[];
  onClear: () => void;
};

export default function HistoryPanel({
  history,
  onClear,
}: Props) {

  const exportHistory = () => {
    const blob = new Blob(
      [JSON.stringify(history, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "qrix-history.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-900 border border-cyan-500/20 rounded-3xl p-6">

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-3xl font-bold">
          QR History
        </h2>

        <div className="flex gap-3">

          <button
            onClick={exportHistory}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold"
          >
            Export JSON
          </button>

          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold"
          >
            Clear
          </button>

        </div>

      </div>

      {history.length === 0 ? (
        <p className="text-gray-400">
          QR codes not generated yet
        </p>
      ) : (
        <div className="space-y-3">

          {history.map((item, index) => (
            <div
              key={index}
              className="bg-black rounded-xl p-3 text-sm break-all"
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}