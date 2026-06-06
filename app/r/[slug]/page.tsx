import { redirect } from "next/navigation";
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

  // /r/[slug] is for direct redirects (non-PIN links)
  redirect(data.target_url);
}