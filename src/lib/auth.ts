import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canOpen, rolePrecedence, type Role } from "@/lib/permissions";

export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export type StaffProfile = {
  /** profiles.id in the church database */
  id: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: string;
  /** Default branch (HQ) used when creating records */
  branchId: string | null;
};

/**
 * Signed-in Supabase Auth user -> church profile (matched by email) -> highest role.
 * The church tables are only reachable with the service role, so every admin page
 * and action goes through this check first.
 */
export const getProfile = cache(async (): Promise<StaffProfile | null> => {
  if (!supabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return profileForEmail(user.email);
});

export async function profileForEmail(email: string): Promise<StaffProfile | null> {
  const db = createAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (!profile) return null;

  const { data: roles } = await db
    .from("user_roles")
    .select("role, organization_id")
    .eq("profile_id", profile.id);
  if (!roles || roles.length === 0) return null;

  const best = [...roles].sort(
    (a, b) => rolePrecedence.indexOf(a.role as Role) - rolePrecedence.indexOf(b.role as Role)
  )[0];

  const { data: branch } = await db
    .from("branches")
    .select("id")
    .eq("organization_id", best.organization_id)
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return {
    id: profile.id,
    fullName: profile.full_name || profile.email || "Staff",
    email: profile.email ?? email,
    role: best.role as Role,
    organizationId: best.organization_id,
    branchId: branch?.id ?? null,
  };
}

/** For admin pages: signed-out users go to login, roles without access go back to the overview. */
export async function requireAccess(href: string): Promise<StaffProfile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "member") redirect("/login?error=no-access");
  if (!canOpen(profile.role, href)) redirect("/admin");
  return profile;
}
