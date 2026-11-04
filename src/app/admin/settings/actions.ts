"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { actionContext, audit, backTo, text } from "@/lib/actions";
import { can, roleLabels, type Role } from "@/lib/permissions";

const HREF = "/admin/settings";
const roles = Object.keys(roleLabels) as Role[];

export async function updateRole(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageRoles);
  const id = text(form, "id");
  const role = text(form, "role") as Role | null;
  if (!id || !role || !roles.includes(role)) backTo(HREF, { error: "Invalid role." });
  if (id === profile.id) backTo(HREF, { error: "You cannot change your own role." });

  // One role per person: replace whatever they had in this church.
  await db.from("user_roles").delete().eq("profile_id", id).eq("organization_id", profile.organizationId);
  const { error } = await db
    .from("user_roles")
    .insert({ profile_id: id, organization_id: profile.organizationId, role });
  if (error) backTo(HREF, { error: "Could not change the role." });

  await audit(db, profile, "role.change", "profile", id, { role });
  revalidatePath(HREF);
  backTo(HREF, { notice: "Role updated" });
}

export async function addStaff(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageRoles);
  const email = text(form, "email")?.toLowerCase();
  const name = text(form, "full_name");
  const role = text(form, "role") as Role | null;
  if (!email || !role || !roles.includes(role)) backTo(HREF, { error: "Enter an email and pick a role." });

  const { data: existing } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  let profileId: string | null = existing?.id ?? null;
  if (!profileId) {
    // open_id is required by the existing table; sign-in matches on email, so this is only a placeholder.
    const { data, error } = await db
      .from("profiles")
      .insert({ open_id: `invite:${randomUUID()}`, email, full_name: name })
      .select("id")
      .single();
    if (error || !data) backTo(HREF, { error: "Could not add this person." });
    profileId = data.id;
  }
  if (!profileId) backTo(HREF, { error: "Could not add this person." });

  await db.from("user_roles").delete().eq("profile_id", profileId).eq("organization_id", profile.organizationId);
  const { error } = await db
    .from("user_roles")
    .insert({ profile_id: profileId, organization_id: profile.organizationId, role });
  if (error) backTo(HREF, { error: "Could not give them a role." });

  await audit(db, profile, "staff.add", "profile", profileId, { email, role });
  revalidatePath(HREF);
  backTo(HREF, { notice: `Added ${email}. Now create their login in Supabase Authentication with the same email.` });
}
