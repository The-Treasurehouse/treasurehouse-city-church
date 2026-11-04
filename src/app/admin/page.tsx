import type { Metadata } from "next";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { canOpen, roleLabels } from "@/lib/permissions";
import { formatDateTime, formatNaira, formatShortDate } from "@/lib/format";
import { Card, PageHeader, StatCard } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  const profile = await requireAccess("/admin");
  const db = createAdminClient();
  const org = profile.organizationId;
  const role = profile.role;

  const seesMembers = canOpen(role, "/admin/members");
  const seesGiving = canOpen(role, "/admin/finance");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
  const thirtyDaysAgo = thirtyDaysAgoDate.toISOString().slice(0, 10);

  const [active, newMembers, visitors, sessions, events, giving] = await Promise.all([
    seesMembers
      ? db.from("members").select("id", { count: "exact", head: true }).eq("organization_id", org).eq("membership_status", "active")
      : null,
    seesMembers
      ? db
          .from("members")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", org)
          .eq("membership_status", "active")
          .gte("join_date", thirtyDaysAgo)
      : null,
    seesMembers
      ? db.from("members").select("id", { count: "exact", head: true }).eq("organization_id", org).eq("membership_status", "visitor")
      : null,
    seesMembers
      ? db
          .from("attendance_sessions")
          .select("id, title, session_date, attendance_records(count)")
          .eq("organization_id", org)
          .lte("session_date", new Date().toISOString().slice(0, 10))
          .order("session_date", { ascending: false })
          .limit(6)
      : null,
    db
      .from("events")
      .select("id, title, starts_at, location")
      .eq("organization_id", org)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(4),
    seesGiving
      ? db.from("giving_records").select("amount").eq("organization_id", org).gte("received_at", monthStart.toISOString())
      : null,
  ]);

  const recent = sessions?.data ?? [];
  const latest = recent[0];
  const previous = recent[1];
  const latestCount = latest?.attendance_records?.[0]?.count ?? 0;
  const previousCount = previous?.attendance_records?.[0]?.count ?? 0;
  const delta = latest && previous ? latestCount - previousCount : null;
  const given = (giving?.data ?? []).reduce((a, r) => a + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title={`Welcome, ${profile.fullName.split(" ")[0]}`}
        description={`Signed in as ${roleLabels[role]}.`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {active && <StatCard label="Active members" value={active.count ?? 0} />}
        {newMembers && <StatCard label="New in 30 days" value={newMembers.count ?? 0} />}
        {visitors && <StatCard label="Visitors on record" value={visitors.count ?? 0} />}
        {latest && (
          <StatCard
            label="Last service"
            value={latestCount}
            hint={delta === null ? latest.title : `${delta >= 0 ? "+" : ""}${delta} vs ${previous?.title ?? "previous"}`}
          />
        )}
        {seesGiving && <StatCard label="Given this month" value={formatNaira(given)} />}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {seesMembers && (
          <Card
            title="Recent attendance"
            action={
              <Link href="/admin/attendance" className="text-xs font-semibold text-accent-ink hover:text-foreground">
                View all
              </Link>
            }
          >
            {recent.length === 0 ? (
              <p className="text-sm text-muted">No services recorded yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {recent.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2.5">
                    <span className="text-foreground">
                      {s.title} <span className="text-muted">{formatShortDate(s.session_date)}</span>
                    </span>
                    <span className="font-semibold text-foreground">{s.attendance_records?.[0]?.count ?? 0}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card
          title="Upcoming events"
          action={
            canOpen(role, "/admin/events") ? (
              <Link href="/admin/events" className="text-xs font-semibold text-accent-ink hover:text-foreground">
                View all
              </Link>
            ) : undefined
          }
        >
          {(events.data ?? []).length === 0 ? (
            <p className="text-sm text-muted">Nothing scheduled.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {(events.data ?? []).map((e) => (
                <li key={e.id} className="py-2.5">
                  <p className="font-medium text-foreground">{e.title}</p>
                  <p className="text-muted">
                    {formatDateTime(e.starts_at)}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
