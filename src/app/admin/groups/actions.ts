"use server";

import { revalidatePath } from "next/cache";
import { actionContext, audit, backTo, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/groups";

export async function createGroup(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageGroups);
  const name = text(form, "name");
  if (!name) backTo(HREF, { error: "Give the group a name." });

  const { data, error } = await db
    .from("groups")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      name,
      category: text(form, "category") ?? "small_group",
      description: text(form, "description"),
      meeting_day: text(form, "meeting_day"),
      meeting_time: text(form, "meeting_time"),
      location: text(form, "location"),
      leader_member_id: text(form, "leader_member_id"),
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not create the group." });

  await audit(db, profile, "group.create", "group", data.id);
  revalidatePath(HREF);
  backTo(HREF, { notice: "Group created" });
}

export async function removeFromGroup(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageGroups);
  const membershipId = text(form, "membership_id");
  if (!membershipId) backTo(HREF, { error: "Missing membership." });

  // History is kept: the membership is ended, not deleted.
  await db.from("group_memberships").update({ ended_at: new Date().toISOString() }).eq("id", membershipId);
  await audit(db, profile, "group.member_remove", "group_membership", membershipId);
  revalidatePath(HREF);
  backTo(HREF, { notice: "Removed from group" });
}
