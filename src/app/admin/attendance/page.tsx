import type { Metadata } from "next";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam, formatShortDate } from "@/lib/format";
import { createSession } from "./actions";
import { Card, Field, Flash, PageHeader, SelectField, SubmitButton, Table, td } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Attendance & Services" };

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/attendance");
  const params = await searchParams;
  const db = createAdminClient();

  const { data: sessions } = await db
    .from("attendance_sessions")
    .select("id, title, category, session_date, attendance_records(count)")
    .eq("organization_id", profile.organizationId)
    .order("session_date", { ascending: false })
    .limit(30);

  return (
    <>
      <PageHeader title="Attendance & Services" description="Set up services and record who attended." />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table head={["Service", "Type", "Date", "Present"]} empty="No services yet.">
            {(sessions ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-surface">
                <td className={td}>
                  <Link href={`/admin/attendance/${s.id}`} className="font-semibold hover:text-accent-ink">
                    {s.title}
                  </Link>
                </td>
                <td className={`${td} capitalize`}>{s.category}</td>
                <td className={td}>{formatShortDate(s.session_date)}</td>
                <td className={td}>{s.attendance_records?.[0]?.count ?? 0}</td>
              </tr>
            ))}
          </Table>
        </div>

        {can.manageServices.includes(profile.role) && (
          <Card title="New service">
            <form action={createSession} className="space-y-4">
              <Field label="Name" name="title" required placeholder="Sunday Worship Service" />
              <SelectField
                label="Type"
                name="category"
                defaultValue="service"
                options={[
                  { value: "service", label: "Sunday service" },
                  { value: "midweek", label: "Midweek service" },
                  { value: "special", label: "Special programme" },
                ]}
              />
              <Field label="Date" name="session_date" type="date" required />
              <SubmitButton>Create service</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
