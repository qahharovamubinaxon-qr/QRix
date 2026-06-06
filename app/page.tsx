"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import AuthMenu from "@/components/AuthMenu";
import QRPreview from "../components/QRPreview";
import { getBaseUrl } from "@/lib/site-url";
import UrlForm from "../components/UrlForm";
import WifiForm from "../components/WifiForm";
import WhatsappForm from "../components/WhatsappForm";
import EmailForm from "../components/EmailForm";
import TelegramForm from "../components/TelegramForm";
import SmsForm from "../components/SmsForm";
import VCardForm from "../components/VCardForm";
import QRTabs from "../components/QRTabs";
import HistoryPanel from "../components/HistoryPanel";
import FavoritesPanel from "../components/FavoritesPanel";
import StatsPanel from "../components/StatsPanel";

export default function Home() {
  const [active, setActive] = useState("URL");

  const [url, setUrl] = useState("https://qrix.com");
  const [pin, setPin] = useState("");

  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [style, setStyle] = useState("square");

  const [size, setSize] = useState(220);

  const [logo, setLogo] = useState("");

  const [history, setHistory] = useState<string[]>([]);
  const [totalQR, setTotalQR] = useState(0);

  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");

  const [telegram, setTelegram] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [protectedUrl, setProtectedUrl] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");

  let qrValue = url;

  if (active === "WiFi") {
    qrValue = `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`;
  }

  if (active === "WhatsApp") {
    qrValue = `https://wa.me/${phone}`;
  }

  if (active === "Email") {
    qrValue = `mailto:${email}`;
  }

  if (active === "Telegram") {
    qrValue = `https://t.me/${telegram.replace("@", "")}`;
  }

  if (active === "SMS") {
    qrValue = `sms:${phone}?body=${encodeURIComponent(message)}`;
  }

  if (active === "vCard") {
    qrValue = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
TEL:${contactPhone}
EMAIL:${contactEmail}
END:VCARD`;
  }

  useEffect(() => {
    const storedHistory = localStorage.getItem("qrix-history");
    const storedFavorites = localStorage.getItem("qrix-favorites");
    const storedTotal = localStorage.getItem("qrix-total");

    /* eslint-disable react-hooks/set-state-in-effect */
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    if (storedTotal) {
      setTotalQR(Number(storedTotal));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const confirmPin = useCallback(async () => {
    if (!pin || pin.length !== 4) {
      alert("PIN 4 ta raqam bo'lishi kerak");
      return;
    }

    setConfirmedPin(pin);

    try {
      const res = await fetch(
        "/api/create-dynamic",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url,
            pin,
          }),
        }
      );

      const data = await res.json();

      if (data.dynamicUrl) {
        setProtectedUrl(getBaseUrl() + data.dynamicUrl);
      }
    } catch (error) {
      console.error(error);
    }
  }, [pin, url]);

  useEffect(() => {
    const handler = () => {
      confirmPin();
    };

    window.addEventListener(
      "confirm-pin",
      handler
    );

    return () => {
      window.removeEventListener(
        "confirm-pin",
        handler
      );
    };
  }, [confirmPin]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("qrix-history");
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem("qrix-favorites");
  };

  const saveToHistory = () => {
    if (!qrValue) return;

    const updated = [qrValue, ...history];
    setHistory(updated);
    localStorage.setItem("qrix-history", JSON.stringify(updated));

    const newTotal = totalQR + 1;
    setTotalQR(newTotal);
    localStorage.setItem("qrix-total", String(newTotal));
  };

  const addToFavorites = () => {
    if (!qrValue) return;

    const updated = [qrValue, ...favorites];
    setFavorites(updated);
    localStorage.setItem("qrix-favorites", JSON.stringify(updated));
  };

  const createDynamicQR = async () => {
    if (!url) return;

    try {
      const res = await fetch(
        "/api/create-dynamic",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            url,
            pin,
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      if (data.dynamicUrl) {
        setUrl(getBaseUrl() + data.dynamicUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <header className="relative z-10 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-black font-bold">
              Q
            </div>

            <span className="text-2xl font-bold">
              QR<span className="text-cyan-400">ix</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AuthMenu />
          </div>

        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">

        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold">
            Create
            <span className="text-cyan-400"> QR </span>
            Codes
          </h1>

          <p className="text-gray-400 mt-4">
            QRix Multi QR Generator Platform
          </p>
        </div>

        <QRTabs
          active={active}
          setActive={setActive}
        />

        <div className="bg-zinc-900 rounded-3xl border border-cyan-500/20 p-6">

          <div className="grid lg:grid-cols-2 gap-10">

            <div>

              <div className="mb-6">
                <label className="text-gray-400 text-sm">
                  Logo Upload
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="block mt-3"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    const reader = new FileReader();

                    reader.onload = () => {
                      setLogo(reader.result as string);
                    };

                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              {active === "URL" && (
                <UrlForm
                  url={url}
                  setUrl={setUrl}
                  pin={pin}
                  setPin={setPin}
                  color={color}
                  setColor={setColor}
                  bgColor={bgColor}
                  setBgColor={setBgColor}
                  size={size}
                  setSize={setSize}
                  style={style}
                  setStyle={setStyle}
                />
              )}

              {active === "WiFi" && (
                <WifiForm
                  wifiName={wifiName}
                  setWifiName={setWifiName}
                  wifiPassword={wifiPassword}
                  setWifiPassword={setWifiPassword}
                />
              )}

              {active === "WhatsApp" && (
                <WhatsappForm
                  phone={phone}
                  setPhone={setPhone}
                />
              )}

              {active === "Email" && (
                <EmailForm
                  email={email}
                  setEmail={setEmail}
                />
              )}

              {active === "Telegram" && (
                <TelegramForm
                  username={telegram}
                  setUsername={setTelegram}
                />
              )}

              {active === "SMS" && (
                <SmsForm
                  phone={phone}
                  setPhone={setPhone}
                  message={message}
                  setMessage={setMessage}
                />
              )}

              {active === "vCard" && (
                <VCardForm
                  name={contactName}
                  setName={setContactName}
                  phone={contactPhone}
                  setPhone={setContactPhone}
                  email={contactEmail}
                  setEmail={setContactEmail}
                />
              )}

            </div>

  <div className="flex flex-col items-center">

  <QRPreview
    value={confirmedPin ? protectedUrl : qrValue}
    color={color}
    bgColor={bgColor}
    size={size}
    logo={logo}
    style={style}
    onDownload={saveToHistory}
  />

  <button
  onClick={addToFavorites}
  className="mt-4 w-full h-12 rounded-xl bg-yellow-500 text-black font-bold"
>
  Add To Favorites
</button>

  <button
  onClick={createDynamicQR}
  className="mt-3 w-full h-12 rounded-xl bg-purple-600 text-white font-bold"
>
  Create Dynamic QR
</button>

</div>

          </div>

        </div>

      </section>

      <div className="max-w-7xl mx-auto px-6 pb-20">

        <StatsPanel
  totalQR={totalQR}
  historyCount={history.length}
  favoritesCount={favorites.length}
/>

        <div className="mt-6">
          <HistoryPanel
  history={history}
  onClear={clearHistory}
/>
<div className="mt-6">
  <FavoritesPanel
    favorites={favorites}
    onClear={clearFavorites}
  />
</div>
        </div>

      </div>

    </main>
  );
}
