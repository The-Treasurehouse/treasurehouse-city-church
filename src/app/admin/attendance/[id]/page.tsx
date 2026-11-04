import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchTerm } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { firstParam, formatShortDate } from "@/lib/format";
import { checkIn, guestCheckIn, undoCheckIn } from "../actions";
import { Card, Field, Flash, PageHeader, SubmitButton, inputClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Check-in" };

export default async function ServiceCheckInPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/attendance");
  const { id } = await params;
  const sp = await searchParams;
  const q = searchTerm(firstParam(sp.q));
  const db = createAdminClient();

  const { data: session } = await db
    .from("attendance_sessions")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organizationId)
    .maybeSingle();
  if (!session) notFound();

  const { data: present } = await db
    .from("attendance_records")
    .select("id, member_id, guest_name, check_in_at, members(first_name, last_name, membership_status)")
    .eq("attendance_session_id", id)
    .order("check_in_at", { ascending: false });

  const checkedInIds = new Set((present ?? []).map((p) => p.member_id).filter(Boolean));

  let results: { id: string; first_name: string; last_name: string; phone: string | null }[] = [];
  if (q) {
    const { data } = await db
      .from("members")
      .select("id, first_name, last_name, phone")
      .eq("organization_id", profile.organizationId)
      .in("membership_status", ["active", "visitor", "inactive"])
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`)
      .order("last_name")
      .limit(15);
    results = data ?? [];
  }

  const canEdit = can.manageServices.includes(profile.role);

  return (
    <>
      <PageHeader
        title={session.title}
        description={`${formatShortDate(session.session_date)} · ${present?.length ?? 0} checked in`}
        action={
          <Link href="/admin/members/new" className="text-sm font-semibold text-accent-ink hover:text-foreground">
            Register a visitor
          </Link>
        }
      />
      <Flash error={firstParam(sp.error)} notice={firstParam(sp.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {canEdit && (
            <Card title="Check someone in">
              <form className="flex gap-3">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search by name or phone"
                  className={`${inputClass} mt-0`}
                  autoFocus
                />
                <button type="submit" className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">
                  Search
                </button>
              </form>

              {q && (
                <ul className="mt-4 divide-y divide-border text-sm">
                  {results.length === 0 && <li className="py-3 text-muted">No one found.</li>}
                  {results.map((m) => (
                    <li key={m.id} className="flex items-center justify-between py-2.5">
                      <span className="text-foreground">
                        {m.first_name} {m.last_name} <span className="text-muted">{m.phone}</span>
                      </span>
                      {checkedInIds.has(m.id) ? (
                        <span className="text-xs font-semibold text-success">Checked in</span>
                      ) : (
                        <form action={checkIn}>
                          <input type="hidden" name="session_id" value={id} />
                          <input type="hidden" name="member_id" value={m.id} />
                          <input type="hidden" name="q" value={q} />
                          <button className="rounded-md bg-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                            Check in
                          </button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card title={`Checked in (${present?.length ?? 0})`}>
            {(present ?? []).length === 0 ? (
              <p className="text-sm text-muted">No one yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {(present ?? []).map((p) => {
                  const m = Array.isArray(p.members) ? p.members[0] : p.members;
                  return (
                    <li key={p.id} className="flex items-center justify-between py-2.5">
                      <span className="text-foreground">
                        {m ? `${m.first_name} ${m.last_name}` : p.guest_name}
                        {(m?.membership_status === "visitor" || !m) && (
                          <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-navy">
                            visitor
                          </span>
                        )}
                      </span>
                      {canEdit && (
                        <form action={undoCheckIn}>
                          <input type="hidden" name="session_id" value={id} />
                          <input type="hidden" name="record_id" value={p.id} />
                          <button className="text-xs font-medium text-muted hover:text-danger">Undo</button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {canEdit && (
          <Card title="Add a guest">
            <form action={guestCheckIn} className="space-y-4">
              <input type="hidden" name="session_id" value={id} />
              <Field label="Guest name" name="guest_name" required />
              <SubmitButton>Add guest</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
