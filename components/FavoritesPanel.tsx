type Props = {
  favorites: string[];
  onClear: () => void;
};

export default function FavoritesPanel({
  favorites,
  onClear,
}: Props) {
  const exportFavorites = () => {
    const blob = new Blob(
      [JSON.stringify(favorites, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "qrix-favorites.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-zinc-900 border border-cyan-500/20 rounded-3xl p-6">

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-3xl font-bold">
          Favorites
        </h2>

        <div className="flex gap-3">

          <button
            onClick={exportFavorites}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold"
          >
            Export
          </button>

          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold"
          >
            Clear
          </button>

        </div>

      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-400">
          No favorites yet
        </p>
      ) : (
        <div className="space-y-3">

          {favorites.map((item, index) => (
            <div
              key={index}
              className="bg-black rounded-xl p-3 break-all"
            >
              {item}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}