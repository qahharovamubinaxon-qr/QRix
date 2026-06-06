type Props = {
  wifiName: string;
  setWifiName: (v: string) => void;
  wifiPassword: string;
  setWifiPassword: (v: string) => void;
};

export default function WifiForm({
  wifiName,
  setWifiName,
  wifiPassword,
  setWifiPassword,
}: Props) {
  return (
    <div className="space-y-5">

      <input
        type="text"
        value={wifiName}
        onChange={(e) => setWifiName(e.target.value)}
        placeholder="WiFi Name (SSID)"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

      <input
        type="text"
        value={wifiPassword}
        onChange={(e) => setWifiPassword(e.target.value)}
        placeholder="WiFi Password"
        className="w-full h-14 px-5 rounded-xl bg-black border border-cyan-500/20"
      />

    </div>
  );
}