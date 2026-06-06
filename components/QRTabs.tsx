type Props = {
  active: string;
  setActive: (value: string) => void;
};

export default function QRTabs({
  active,
  setActive,
}: Props) {
  const tabs = [
  "URL",
  "WiFi",
  "WhatsApp",
  "Email",
  "Telegram",
  "SMS",
  "vCard",
];

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-5 py-3 rounded-xl border transition-all
          ${
            active === tab
              ? "bg-cyan-500 text-black border-cyan-500"
              : "border-cyan-500/20 text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}