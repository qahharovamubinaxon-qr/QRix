"use client";

/* Реал Recent Files ва PDF статистикаси — localStorage'да сақланади */

export type RecentFile = {
  name: string;
  size: number; // bytes
  time: string; // ISO
  tool?: string;
};

export type PdfStats = {
  files: number;
  bytes: number;
  seconds: number;
};

const RF_KEY = "qrix-recent-files";
const ST_KEY = "qrix-pdf-stats";

export function getRecentFiles(): RecentFile[] {
  try {
    return JSON.parse(localStorage.getItem(RF_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addRecentFile(f: { name: string; size: number; tool?: string }) {
  try {
    const list = getRecentFiles();
    list.unshift({ ...f, time: new Date().toISOString() });
    localStorage.setItem(RF_KEY, JSON.stringify(list.slice(0, 10)));
    window.dispatchEvent(new Event("qrix-pdf-update"));
  } catch {}
}

export function getPdfStats(): PdfStats {
  try {
    return { files: 0, bytes: 0, seconds: 0, ...JSON.parse(localStorage.getItem(ST_KEY) || "{}") };
  } catch {
    return { files: 0, bytes: 0, seconds: 0 };
  }
}

export function bumpPdfStats(bytes: number, seconds: number) {
  try {
    const s = getPdfStats();
    s.files += 1;
    s.bytes += bytes;
    s.seconds += seconds;
    localStorage.setItem(ST_KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("qrix-pdf-update"));
  } catch {}
}

export function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function fmtAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  return `${Math.floor(h / 24)} day${h >= 48 ? "s" : ""} ago`;
}
