import LoginForm from "@/components/auth/LoginForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginContent({ searchParams }) {
  const redirectTo = searchParams?.redirectTo || "/dashboard";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return <LoginForm redirectTo={redirectTo} />;
}
