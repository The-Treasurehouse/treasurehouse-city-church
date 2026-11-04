"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionContext, audit, backTo, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/members";
const STATUSES = ["visitor", "active", "inactive", "transferred", "deceased"];

export async function createMember(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageMembers);

  const firstName = text(form, "first_name");
  const lastName = text(form, "last_name");
  if (!firstName || !lastName) backTo(`${HREF}/new`, { error: "First and last name are required." });

  const status = text(form, "membership_status") ?? "active";
  if (!STATUSES.includes(status)) backTo(`${HREF}/new`, { error: "Pick a valid status." });

  const { data, error } = await db
    .from("members")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      first_name: firstName,
      last_name: lastName,
      preferred_name: text(form, "preferred_name"),
      email: text(form, "email"),
      phone: text(form, "phone"),
      date_of_birth: text(form, "date_of_birth"),
      join_date: text(form, "join_date"),
      membership_status: status,
      address_line_1: text(form, "address_line_1"),
      city: text(form, "city"),
      region: text(form, "region"),
      country: text(form, "country"),
      email_opt_in: form.get("email_opt_in") === "on",
      pastoral_notes: can.pastoralNotes.includes(profile.role) ? text(form, "pastoral_notes") : null,
    })
    .select("id")
    .single();

  if (error || !data) backTo(`${HREF}/new`, { error: "Could not save this member. Check the details and try again." });

  await audit(db, profile, "member.create", "member", data.id);
  revalidatePath(HREF);
  redirect(`${HREF}/${data.id}?notice=Member%20added`);
}

export async function updateMemberStatus(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageMembers);
  const id = text(form, "id");
  const status = text(form, "membership_status");
  if (!id || !status || !STATUSES.includes(status)) backTo(HREF, { error: "Missing member or status." });

  const { error } = await db
    .from("members")
    .update({ membership_status: status })
    .eq("id", id)
    .eq("organization_id", profile.organizationId);
  if (error) backTo(`${HREF}/${id}`, { error: "Could not update the status." });

  await audit(db, profile, "member.status", "member", id, { status });
  revalidatePath(HREF);
  backTo(`${HREF}/${id}`, { notice: "Status updated" });
}

export async function savePastoralNotes(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.pastoralNotes);
  const id = text(form, "id");
  if (!id) backTo(HREF, { error: "Missing member." });

  const { error } = await db
    .from("members")
    .update({ pastoral_notes: text(form, "pastoral_notes") })
    .eq("id", id)
    .eq("organization_id", profile.organizationId);
  if (error) backTo(`${HREF}/${id}`, { error: "Could not save the notes." });

  await audit(db, profile, "member.pastoral_notes", "member", id);
  backTo(`${HREF}/${id}`, { notice: "Notes saved" });
}

export async function addToGroup(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageMembers);
  const memberId = text(form, "member_id");
  const groupId = text(form, "group_id");
  if (!memberId || !groupId) backTo(HREF, { error: "Pick a group." });

  const { data: existing } = await db
    .from("group_memberships")
    .select("id")
    .eq("member_id", memberId)
    .eq("group_id", groupId)
    .is("ended_at", null)
    .maybeSingle();
  if (!existing) {
    const { error } = await db.from("group_memberships").insert({ member_id: memberId, group_id: groupId });
    if (error) backTo(`${HREF}/${memberId}`, { error: "Could not add to that group." });
    await audit(db, profile, "group.member_add", "group", groupId, { memberId });
  }

  revalidatePath(`${HREF}/${memberId}`);
  backTo(`${HREF}/${memberId}`, { notice: "Added to group" });
}
