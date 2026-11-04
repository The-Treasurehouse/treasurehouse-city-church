import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam, formatShortDate } from "@/lib/format";
import { addToGroup, savePastoralNotes, updateMemberStatus } from "../actions";
import { Badge, Card, Flash, PageHeader, SelectField, SubmitButton, TextAreaField } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Member" };

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value || "Not provided"}</dd>
    </div>
  );
}

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/members");
  const { id } = await params;
  const sp = await searchParams;
  const db = createAdminClient();

  const { data: member } = await db
    .from("members")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organizationId)
    .maybeSingle();
  if (!member) notFound();

  const canManage = can.manageMembers.includes(profile.role);
  const canNotes = can.pastoralNotes.includes(profile.role);

  const [{ data: memberships }, { data: allGroups }, { data: attendance }] = await Promise.all([
    db.from("group_memberships").select("membership_role, groups(id, name)").eq("member_id", id).is("ended_at", null),
    canManage
      ? db.from("groups").select("id, name").eq("organization_id", profile.organizationId).eq("is_active", true).order("name")
      : Promise.resolve({ data: [] }),
    db
      .from("attendance_records")
      .select("status, check_in_at, attendance_sessions(title, session_date)")
      .eq("member_id", id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const address = [member.address_line_1, member.city, member.region, member.country].filter(Boolean).join(", ");

  return (
    <>
      <PageHeader
        title={`${member.first_name} ${member.last_name}`}
        description={member.join_date ? `Joined ${formatShortDate(member.join_date)}` : undefined}
        action={<Badge tone={member.membership_status === "active" ? "success" : "neutral"}>{member.membership_status}</Badge>}
      />
      <Flash error={firstParam(sp.error)} notice={firstParam(sp.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card title="Profile">
            <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <Detail label="Preferred name" value={member.preferred_name} />
              <Detail label="Phone" value={member.phone} />
              <Detail label="Email" value={member.email} />
              <Detail label="Date of birth" value={member.date_of_birth && formatShortDate(member.date_of_birth)} />
              <Detail label="Address" value={address} />
              <Detail label="Emails" value={member.email_opt_in ? "Opted in" : "Opted out"} />
            </dl>
          </Card>

          {canNotes && (
            <Card title="Pastoral notes (private)">
              <form action={savePastoralNotes} className="space-y-3">
                <input type="hidden" name="id" value={member.id} />
                <TextAreaField label="Notes" name="pastoral_notes" rows={4} defaultValue={member.pastoral_notes ?? ""} />
                <SubmitButton>Save notes</SubmitButton>
              </form>
            </Card>
          )}

          <Card title="Recent attendance">
            {(attendance ?? []).length === 0 ? (
              <p className="text-sm text-muted">No attendance recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {(attendance ?? []).map((a, i) => {
                  const s = Array.isArray(a.attendance_sessions) ? a.attendance_sessions[0] : a.attendance_sessions;
                  return (
                    <li key={i} className="flex justify-between py-2">
                      <span className="text-foreground">{s?.title}</span>
                      <span className="text-muted">{formatShortDate(s?.session_date)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Groups">
            {(memberships ?? []).length === 0 ? (
              <p className="text-sm text-muted">Not in any group.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(memberships ?? []).map((m, i) => {
                  const g = Array.isArray(m.groups) ? m.groups[0] : m.groups;
                  return (
                    <li key={i}>
                      <Link href="/admin/groups" className="font-medium text-foreground hover:text-accent-ink">
                        {g?.name}
                      </Link>
                      <span className="ml-2 text-muted">{m.membership_role}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {canManage && (allGroups ?? []).length > 0 && (
              <form action={addToGroup} className="mt-5 space-y-3 border-t border-border pt-5">
                <input type="hidden" name="member_id" value={member.id} />
                <SelectField
                  label="Add to group"
                  name="group_id"
                  required
                  placeholder="Select"
                  options={(allGroups ?? []).map((g) => ({ value: g.id, label: g.name }))}
                />
                <SubmitButton>Add</SubmitButton>
              </form>
            )}
          </Card>

          {canManage && (
            <Card title="Membership status">
              <form action={updateMemberStatus} className="space-y-3">
                <input type="hidden" name="id" value={member.id} />
                <SelectField
                  label="Status"
                  name="membership_status"
                  defaultValue={member.membership_status}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "visitor", label: "Visitor" },
                    { value: "inactive", label: "Inactive" },
                    { value: "transferred", label: "Transferred" },
                    { value: "deceased", label: "Deceased" },
                  ]}
                />
                <SubmitButton>Update</SubmitButton>
              </form>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
