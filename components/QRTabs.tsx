import { FiLink, FiWifi, FiMessageSquare, FiMail, FiSend, FiSmartphone, FiUser } from "react-icons/fi";

type Props = {
  active: string;
  setActive: (value: string) => void;
  dark?: boolean;
};

const TABS = [
  { label: "URL", icon: <FiLink size={14} />, neon: "#06b6d4", shadow: "rgba(6,182,212,0.4)" },
  { label: "WiFi", icon: <FiWifi size={14} />, neon: "#22c55e", shadow: "rgba(34,197,94,0.4)" },
  { label: "WhatsApp", icon: <FiMessageSquare size={14} />, neon: "#10b981", shadow: "rgba(16,185,129,0.4)" },
  { label: "Email", icon: <FiMail size={14} />, neon: "#a855f7", shadow: "rgba(168,85,247,0.4)" },
  { label: "Telegram", icon: <FiSend size={14} />, neon: "#3b82f6", shadow: "rgba(59,130,246,0.4)" },
  { label: "SMS", icon: <FiSmartphone size={14} />, neon: "#eab308", shadow: "rgba(234,179,8,0.4)" },
  { label: "vCard", icon: <FiUser size={14} />, neon: "#f97316", shadow: "rgba(249,115,22,0.4)" },
];

export default function QRTabs({ active, setActive, dark = true }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => setActive(tab.label)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${tab.neon}22, ${tab.neon}11)`
                : dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${isActive ? tab.neon : dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
              color: isActive ? tab.neon : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              boxShadow: isActive ? `0 0 12px ${tab.shadow}, inset 0 0 12px ${tab.neon}11` : "none",
              transform: isActive ? "translateY(-1px)" : "none",
            }}
          >
            {/* Neon top line */}
            {isActive && (
              <span
                className="absolute top-0 left-3 right-3 h-px rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${tab.neon}, transparent)` }}
              />
            )}
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}