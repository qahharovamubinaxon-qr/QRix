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

  // If no PIN set, redirect to /r/[slug]
  if (!data.pin) {
    redirect(`/r/${slug}`);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-8 rounded-3xl w-96">
        <h1 className="text-2xl font-bold mb-5">
          PIN Protected QR
        </h1>

        <form
          action={`/pin/${slug}/verify`}
          method="POST"
        >
          <input
            name="pin"
            type="password"
            placeholder="Enter PIN"
            className="w-full h-12 px-4 rounded-xl bg-black border border-cyan-500/20"
          />

          <button
            className="w-full h-12 mt-4 rounded-xl bg-cyan-500 text-black font-bold"
          >
            Open Link
          </button>
        </form>
      </div>
    </div>
  );
}
