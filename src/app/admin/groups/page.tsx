import type { Metadata } from "next";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam } from "@/lib/format";
import { createGroup, removeFromGroup } from "./actions";
import { Card, Field, Flash, PageHeader, SelectField, SubmitButton } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Groups" };

type Membership = {
  id: string;
  ended_at: string | null;
  members: { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null;
};

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/groups");
  const params = await searchParams;
  const db = createAdminClient();
  const canManage = can.manageGroups.includes(profile.role);

  const [{ data: groups }, { data: people }] = await Promise.all([
    db
      .from("groups")
      .select(
        "id, name, category, description, meeting_day, meeting_time, location, members!leader_member_id(first_name, last_name), group_memberships(id, ended_at, members(id, first_name, last_name))"
      )
      .eq("organization_id", profile.organizationId)
      .eq("is_active", true)
      .order("name"),
    canManage
      ? db
          .from("members")
          .select("id, first_name, last_name")
          .eq("organization_id", profile.organizationId)
          .eq("membership_status", "active")
          .order("last_name")
          .limit(300)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <>
      <PageHeader
        title="Groups"
        description="Departments, ministries, cell groups and teams. Add people from their member profile."
      />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {(groups ?? []).length === 0 && (
            <p className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted">
              No groups yet.
            </p>
          )}
          {(groups ?? []).map((g) => {
            const leader = Array.isArray(g.members) ? g.members[0] : g.members;
            const active = (g.group_memberships as Membership[]).filter((m) => !m.ended_at);
            const when = [g.meeting_day, g.meeting_time].filter(Boolean).join(" ");
            return (
              <Card key={g.id} title={g.name}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{g.category.replace("_", " ")}</p>
                {g.description && <p className="mt-2 text-sm text-muted">{g.description}</p>}
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-semibold">Leader:</span> {leader ? `${leader.first_name} ${leader.last_name}` : "Not assigned"}
                  {when && <span className="ml-3 text-muted">{when}</span>}
                  {g.location && <span className="ml-3 text-muted">{g.location}</span>}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Members ({active.length})</p>
                <ul className="mt-2 divide-y divide-border text-sm">
                  {active.map((gm) => {
                    const m = Array.isArray(gm.members) ? gm.members[0] : gm.members;
                    if (!m) return null;
                    return (
                      <li key={gm.id} className="flex items-center justify-between py-2">
                        <Link href={`/admin/members/${m.id}`} className="text-foreground hover:text-accent-ink">
                          {m.first_name} {m.last_name}
                        </Link>
                        {canManage && (
                          <form action={removeFromGroup}>
                            <input type="hidden" name="membership_id" value={gm.id} />
                            <button className="text-xs font-medium text-muted hover:text-danger">Remove</button>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>

        {canManage && (
          <Card title="New group">
            <form action={createGroup} className="space-y-4">
              <Field label="Name" name="name" required placeholder="Choir" />
              <SelectField
                label="Type"
                name="category"
                defaultValue="small_group"
                options={[
                  { value: "department", label: "Department" },
                  { value: "ministry", label: "Ministry" },
                  { value: "small_group", label: "Cell or small group" },
                  { value: "team", label: "Service team" },
                ]}
              />
              <Field label="Description" name="description" />
              <SelectField
                label="Leader"
                name="leader_member_id"
                placeholder="Assign later"
                options={(people ?? []).map((p) => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }))}
              />
              <Field label="Meeting day" name="meeting_day" placeholder="Wednesday" />
              <Field label="Meeting time" name="meeting_time" placeholder="6:00 PM" />
              <Field label="Location" name="location" />
              <SubmitButton>Create group</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
