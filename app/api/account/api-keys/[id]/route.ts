import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { revokeKey } from "@/lib/server/user-api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Revoke. Rows are kept, not deleted: the customer needs to see that the key
   they pulled out of a leaked repo is dead, and when it was last used. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  const { id } = await params;
  /* Scoped by user_id inside revokeKey, so a guessed id from another account
     revokes nothing and is reported the same as an id that never existed. */
  const done = await revokeKey(id, data.user.id);
  return NextResponse.json({ revoked: done }, { status: done ? 200 : 404 });
}
