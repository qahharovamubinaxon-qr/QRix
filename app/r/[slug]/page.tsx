import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { slug } = await params;

  const { data } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return (
      <h1 className="text-white p-10">
        Link not found
      </h1>
    );
  }

  // If this slug is PIN protected, redirect to the PIN page.
  if (data.pin) {
  redirect(`/pin/${slug}`);
}

const headersList = await headers();

const userAgent =
  headersList.get("user-agent") || "unknown";

const scanResult = await supabase
  .from("qr_scans")
  .insert({
    slug,
    user_agent: userAgent,
  });

console.log("SCAN RESULT:", scanResult);

await supabase
  .from("dynamic_links")
  .update({
    scans: (data.scans || 0) + 1,
  })
  .eq("slug", slug);

redirect(data.target_url);
}