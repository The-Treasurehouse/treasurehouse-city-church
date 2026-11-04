"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileForEmail, supabaseConfigured } from "@/lib/auth";

export async function signIn(formData: FormData) {
  if (!supabaseConfigured) redirect("/login?error=Supabase%20is%20not%20connected%20yet");

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=Wrong%20email%20or%20password");

  // A login alone is not enough: the email must belong to a church profile with a staff role.
  const profile = await profileForEmail(email);
  if (!profile || profile.role === "member") {
    await supabase.auth.signOut();
    redirect("/login?error=no-access");
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
