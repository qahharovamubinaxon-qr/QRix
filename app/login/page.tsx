import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}