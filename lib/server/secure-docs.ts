/**
 * Storage half of the code-gated document flow. SERVER ONLY.
 *
 * A caller posts a URL it already has (an image host, say) plus a 4-digit code.
 * We hand back a short URL. Whoever opens it is asked for the code, and on
 * success sees the document rendered on that page — never the URL behind it.
 *
 * That last part is the whole point, and it is why this is not a dynamic link:
 * a redirect puts the destination in the address bar, in history, in the
 * Referer and in any screenshot, which makes the code pointless. Here the
 * server fetches the bytes and streams them.
 *
 * Everything that needs no database — id generation, destination rules, the
 * unlock token — lives in lib/secure-doc-core.ts so it can be imported by a
 * test without dragging Supabase along. Re-exported here so call sites have one
 * import.
 */

import { createAdminClient } from "@/lib/supabase-admin";
import { hashPassword, verifyPassword } from "@/lib/server/security";
import { newId } from "@/lib/secure-doc-core";

export {
  newId, isSafeTarget, shortBase, shortUrl, COOKIE, mintUnlock, unlockValid,
} from "@/lib/secure-doc-core";

export type SecureDoc = {
  id: string;
  user_id: string;
  target_url: string;
  code_hash: string;
  title: string | null;
  views: number;
};

const admin = () => {
  const c = createAdminClient();
  if (!c) throw new Error("supabase_service_role_missing");
  return c;
};

/* ── storage ─────────────────────────────────────────────────────────────── */

export async function createDoc(input: {
  userId: string; targetUrl: string; code: string; title?: string | null;
}): Promise<{ id: string }> {
  const code_hash = await hashPassword(input.code);
  /* Six characters out of a 57-character alphabet is ~34 bits; collisions are
     rare but not impossible once there are tens of thousands of rows, so retry
     rather than hand the caller a failure it cannot act on. */
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = newId();
    const { error } = await admin().from("secure_docs").insert({
      id, user_id: input.userId, target_url: input.targetUrl,
      code_hash, title: input.title?.slice(0, 200) ?? null,
    });
    if (!error) return { id };
    if (!String(error.message).toLowerCase().includes("duplicate")) throw new Error(error.message);
  }
  throw new Error("id_collision");
}

export async function getDoc(id: string): Promise<SecureDoc | null> {
  const { data } = await admin()
    .from("secure_docs").select("id, user_id, target_url, code_hash, title, views")
    .eq("id", id).maybeSingle();
  return (data as SecureDoc) ?? null;
}

export async function checkCode(doc: SecureDoc, code: string): Promise<boolean> {
  return verifyPassword(code, doc.code_hash);
}

export async function countView(id: string, views: number): Promise<void> {
  await admin().from("secure_docs")
    .update({ views: views + 1, last_viewed_at: new Date().toISOString() })
    .eq("id", id);
}
