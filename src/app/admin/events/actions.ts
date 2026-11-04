"use server";

import { revalidatePath } from "next/cache";
import { actionContext, audit, backTo, num, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/events";

export async function createEvent(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageEvents);
  const title = text(form, "title");
  const startsAt = text(form, "starts_at");
  if (!title || !startsAt) backTo(HREF, { error: "Title and start time are required." });

  const capacity = num(form, "capacity");
  const { data, error } = await db
    .from("events")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      title,
      description: text(form, "description"),
      starts_at: new Date(startsAt).toISOString(),
      location: text(form, "location"),
      capacity: capacity && capacity > 0 ? capacity : null,
      rsvp_enabled: form.get("rsvp_enabled") === "on",
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not create the event." });

  await audit(db, profile, "event.create", "event", data.id);
  revalidatePath(HREF);
  backTo(HREF, { notice: "Event created" });
}
