"use server";

import { revalidatePath } from "next/cache";
import { actionContext, audit, backTo, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/communication";

export async function createAnnouncement(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageAnnouncements);
  const title = text(form, "title");
  const body = text(form, "body");
  if (!title || !body) backTo(HREF, { error: "Add a title and a message." });

  const groupId = text(form, "group_id");
  const publishAt = text(form, "publish_at");
  const { data, error } = await db
    .from("announcements")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      title,
      body,
      audience_type: groupId ? "group" : "organization",
      audience_reference_id: groupId,
      publish_at: publishAt ? new Date(publishAt).toISOString() : new Date().toISOString(),
      created_by_profile_id: profile.id,
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not save the announcement." });

  await audit(db, profile, "announcement.create", "announcement", data.id);
  revalidatePath(HREF);
  backTo(HREF, { notice: publishAt ? "Announcement scheduled" : "Announcement published" });
}
