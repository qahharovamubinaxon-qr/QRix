"use client";

import { useEffect } from "react";
import { isLang, isRtlLang } from "@/lib/lang";

/**
 * Keeps <html lang> and <html dir> in sync with the chosen UI language.
 *
 * The app shell is server-rendered as lang="en" (the UI language lives in
 * localStorage, so it isn't known at request time). This corrects the document
 * after hydration so screen readers, browser translation and — critically — RTL
 * layout for Arabic/Urdu behave correctly. Server-rendered /use/[lang] SEO pages
 * already set their own lang/dir and are unaffected.
 */
export default function HtmlLangSync() {
  useEffect(() => {
    const apply = () => {
      const saved = localStorage.getItem("language");
      const lang = isLang(saved) ? saved : "en";
      const el = document.documentElement;
      el.lang = lang;
      el.dir = isRtlLang(lang) ? "rtl" : "ltr";
    };
    apply();
    window.addEventListener("qrix-lang", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("qrix-lang", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return null;
}
