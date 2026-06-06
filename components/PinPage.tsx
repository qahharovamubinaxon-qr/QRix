"use client";

import { useState } from "react";

export default function PinPage() {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");

  const checkPin = () => {
    if (pin === "2525") {
      setStatus("Access Granted");
    } else {
      setStatus("Wrong PIN");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">

      <div className="bg-zinc-900 p-8 rounded-3xl w-[400px]">

        <h1 className="text-white text-3xl font-bold">
          Enter PIN
        </h1>

        <input
          value={pin}
          onChange={(e) =>
            setPin(e.target.value)
          }
          className="w-full mt-5 h-12 px-4 bg-black text-white rounded-xl"
        />

        <button
          onClick={checkPin}
          className="w-full mt-5 h-12 bg-cyan-500 rounded-xl text-black font-bold"
        >
          Verify
        </button>

        <p className="mt-4 text-cyan-400">
          {status}
        </p>

      </div>

    </div>
  );
}