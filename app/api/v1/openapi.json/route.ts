import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/server/openapi";

export const runtime = "nodejs";

/** Public OpenAPI 3.1 document for the QRix API. */
export async function GET() {
  return NextResponse.json(openApiSpec(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
