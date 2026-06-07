import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <RegisterClient />;
}