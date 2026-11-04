import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAccess, type StaffProfile } from "@/lib/auth";
import type { Role } from "@/lib/permissions";

/**
 * Start of every admin server action. Checks the menu rule for the page, and optionally
 * the stricter rule for the change being made, then hands back the database client.
 */
export async function actionContext(href: string, allowed?: Role[]) {
  const profile = await requireAccess(href);
  if (allowed && !allowed.includes(profile.role)) {
    backTo(href, { error: "Your role cannot make this change." });
  }
  return { profile, db: createAdminClient() };
}

export function backTo(path: string, flash: { error?: string; notice?: string }): never {
  const params = new URLSearchParams();
  if (flash.error) params.set("error", flash.error);
  if (flash.notice) params.set("notice", flash.notice);
  redirect(`${path}?${params.toString()}`);
}

export async function audit(
  db: ReturnType<typeof createAdminClient>,
  profile: StaffProfile,
  action: string,
  resourceType: string,
  resourceId: string | null,
  metadata: Record<string, unknown> = {}
) {
  await db.from("audit_events").insert({
    organization_id: profile.organizationId,
    actor_profile_id: profile.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata,
  });
}

export function text(form: FormData, key: string) {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function num(form: FormData, key: string) {
  const value = text(form, key);
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Strips characters that would break a PostgREST filter string. */
export function searchTerm(value: string | undefined) {
  return (value ?? "").replace(/[,()%*\\"]/g, " ").trim();
}
