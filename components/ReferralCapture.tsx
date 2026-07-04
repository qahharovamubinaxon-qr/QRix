"use client";

import { useEffect } from "react";

/**
 * Captures a `?ref=CODE` query param into a first-party cookie so it survives
 * until the visitor signs up. RegisterClient reads `qrix_ref` after signup and
 * calls /api/referral/claim. Mounted once in the root layout.
 */
export default function ReferralCapture() {
  useEffect(() => {
    try {
      const code = new URLSearchParams(window.location.search).get("ref");
      if (code && /^[a-z0-9]{4,16}$/.test(code) && !document.cookie.includes("qrix_ref=")) {
        // 30-day cookie
        document.cookie = `qrix_ref=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
