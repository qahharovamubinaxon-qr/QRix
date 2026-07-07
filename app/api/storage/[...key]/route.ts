import { NextRequest, NextResponse } from "next/server";
import { storageDriver } from "@/lib/server/storage";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";

/** Serve locally-stored uploads (local driver only; S3/Supabase use direct URLs). */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key } = await ctx.params;
  const fullKey = key.map(decodeURIComponent).join("/");
  const rec = db.uploads.find((u) => u.key === fullKey);
  const buf = await storageDriver.get(fullKey);
  if (!buf) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": rec?.mime || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${(rec?.name || "file").replace(/[^\w.-]/g, "_")}"`,
    },
  });
}
