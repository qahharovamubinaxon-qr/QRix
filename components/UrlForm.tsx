type Props = {
  url: string;
  setUrl: (value: string) => void;
  pin: string;
  setPin: (value: string) => void;
  customSlug: string;
  setCustomSlug: (value: string) => void;
  color: string;
  setColor: (value: string) => void;
  bgColor: string;
  setBgColor: (value: string) => void;
  size: number;
  setSize: (value: number) => void;
  style: string;
  setStyle: (value: string) => void;
};

export default function UrlForm({
  url,
  setUrl,
  pin,
  setPin,
  customSlug,
  setCustomSlug,
  color,
  setColor,
  bgColor,
  setBgColor,
  size,
  setSize,
  style,
  setStyle,
}: Props) {
  return (
    <div>

      <label className="text-gray-400 text-sm">
        Website URL
      </label>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://yourwebsite.com"
        className="w-full mt-3 h-14 px-5 rounded-xl bg-black border border-cyan-500/20 outline-none"
      />

      <div className="mt-5">
        <label className="text-gray-400 text-sm">
          PIN Code (Optional)
        </label>

        <input
          type="text"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="1234"
          className="w-full mt-3 h-14 px-5 rounded-xl bg-black border border-cyan-500/20 outline-none"
        />

        <button
          onClick={() => {
            const event =
              new CustomEvent("confirm-pin");

            window.dispatchEvent(event);
          }}
          className="mt-3 px-4 py-2 bg-cyan-500 text-black rounded-xl font-bold"
        >
          Confirm PIN
        </button>
      </div>
      
      <div className="mt-5">
  <label className="text-gray-400 text-sm">
    Custom Slug (Optional)
  </label>

  <input
    type="text"
    value={customSlug}
    onChange={(e) => setCustomSlug(e.target.value)}
    placeholder="myyoutube"
    className="w-full mt-3 h-14 px-5 rounded-xl bg-black border border-cyan-500/20 outline-none"
  />
      </div>
      <div className="grid grid-cols-2 gap-5 mt-5">

        <div>
          <label className="text-gray-400 text-sm">
            QR Color
          </label>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="block mt-3 w-full h-12"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm">
            Background Color
          </label>

          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="block mt-3 w-full h-12"
          />
        </div>

      </div>

      <div className="mt-5">
        <label className="text-gray-400 text-sm">
          QR Size
        </label>

        <select
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="mt-3 w-full h-12 rounded-xl bg-black border border-cyan-500/20 px-4"
        >
          <option value={220}>220 px</option>
          <option value={300}>300 px</option>
          <option value={400}>400 px</option>
          <option value={512}>512 px</option>
        </select>
      </div>

      <div className="mt-5">

        <label className="text-gray-400 text-sm">
          QR Style
        </label>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="mt-3 w-full h-12 rounded-xl bg-black border border-cyan-500/20 px-4"
        >
          <option value="square">Square</option>
          <option value="rounded">Rounded</option>
        </select>

      </div>

    </div>
  );
}