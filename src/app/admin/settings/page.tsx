import type { Metadata } from "next";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { firstParam } from "@/lib/format";
import { roleLabels, rolePrecedence, type Role } from "@/lib/permissions";
import { addStaff, updateRole } from "./actions";
import { Card, Field, Flash, PageHeader, SelectField, SubmitButton, Table, td, inputClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/settings");
  const params = await searchParams;
  const db = createAdminClient();

  const { data: people } = await db
    .from("profiles")
    .select("id, full_name, email, user_roles(role, organization_id)")
    .order("created_at");

  const roleOptions = rolePrecedence.map((r) => ({ value: r, label: roleLabels[r] }));

  return (
    <>
      <PageHeader title="Settings" description="Who can sign in and what they can see." />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table head={["Name", "Email", "Role"]} empty="No accounts yet.">
            {(people ?? []).map((p) => {
              const mine = (p.user_roles as { role: Role; organization_id: string }[]).find(
                (r) => r.organization_id === profile.organizationId
              );
              return (
                <tr key={p.id}>
                  <td className={td}>{p.full_name || "Unnamed"}</td>
                  <td className={td}>{p.email}</td>
                  <td className={td}>
                    {p.id === profile.id ? (
                      <span className="font-semibold">{mine ? roleLabels[mine.role] : "None"} (you)</span>
                    ) : (
                      <form action={updateRole} className="flex gap-2">
                        <input type="hidden" name="id" value={p.id} />
                        <select name="role" defaultValue={mine?.role ?? "member"} className={`${inputClass} mt-0 max-w-56`}>
                          {roleOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white">Save</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>

        <Card title="Add staff">
          <form action={addStaff} className="space-y-4">
            <Field label="Full name" name="full_name" />
            <Field label="Email" name="email" type="email" required />
            <SelectField label="Role" name="role" required defaultValue="administrator" options={roleOptions} />
            <SubmitButton>Add</SubmitButton>
          </form>
          <p className="mt-4 text-sm text-muted">
            This gives the email a role. They also need a login: create the same email under Authentication in
            Supabase, then they can sign in here.
          </p>
        </Card>
      </div>
    </>
  );
}
