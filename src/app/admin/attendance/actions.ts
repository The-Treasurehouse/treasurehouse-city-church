"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionContext, audit, backTo, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/attendance";

export async function createSession(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageServices);
  const title = text(form, "title");
  const sessionDate = text(form, "session_date");
  if (!title || !sessionDate) backTo(HREF, { error: "Name and date are required." });

  const { data, error } = await db
    .from("attendance_sessions")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      title,
      session_date: sessionDate,
      category: text(form, "category") ?? "service",
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not create the service." });

  await audit(db, profile, "attendance_session.create", "attendance_session", data.id);
  revalidatePath(HREF);
  redirect(`${HREF}/${data.id}`);
}

/** Checks the session belongs to this church before touching its records. */
async function ownSession(db: Awaited<ReturnType<typeof actionContext>>["db"], orgId: string, sessionId: string) {
  const { data } = await db
    .from("attendance_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("organization_id", orgId)
    .maybeSingle();
  return Boolean(data);
}

export async function checkIn(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageServices);
  const sessionId = text(form, "session_id");
  const memberId = text(form, "member_id");
  if (!sessionId || !memberId) backTo(HREF, { error: "Missing service or member." });
  if (!(await ownSession(db, profile.organizationId, sessionId))) backTo(HREF, { error: "Service not found." });

  const { data: already } = await db
    .from("attendance_records")
    .select("id")
    .eq("attendance_session_id", sessionId)
    .eq("member_id", memberId)
    .maybeSingle();
  if (!already) {
    const { error } = await db.from("attendance_records").insert({
      attendance_session_id: sessionId,
      member_id: memberId,
      status: "present",
      check_in_at: new Date().toISOString(),
    });
    if (error) backTo(`${HREF}/${sessionId}`, { error: "Check-in failed." });
  }

  revalidatePath(`${HREF}/${sessionId}`);
  const q = text(form, "q");
  redirect(`${HREF}/${sessionId}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}

export async function guestCheckIn(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageServices);
  const sessionId = text(form, "session_id");
  const guest = text(form, "guest_name");
  if (!sessionId || !guest) backTo(HREF, { error: "Enter the guest's name." });
  if (!(await ownSession(db, profile.organizationId, sessionId))) backTo(HREF, { error: "Service not found." });

  const { error } = await db.from("attendance_records").insert({
    attendance_session_id: sessionId,
    guest_name: guest,
    status: "guest",
    check_in_at: new Date().toISOString(),
  });
  if (error) backTo(`${HREF}/${sessionId}`, { error: "Could not add the guest." });

  revalidatePath(`${HREF}/${sessionId}`);
  backTo(`${HREF}/${sessionId}`, { notice: "Guest added" });
}

export async function undoCheckIn(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.manageServices);
  const sessionId = text(form, "session_id");
  const recordId = text(form, "record_id");
  if (!sessionId || !recordId) backTo(HREF, { error: "Missing check-in." });
  if (!(await ownSession(db, profile.organizationId, sessionId))) backTo(HREF, { error: "Service not found." });

  await db.from("attendance_records").delete().eq("id", recordId).eq("attendance_session_id", sessionId);
  revalidatePath(`${HREF}/${sessionId}`);
  redirect(`${HREF}/${sessionId}`);
}
