import type { Metadata } from "next";
import { requireAccess } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { firstParam } from "@/lib/format";
import { createMember } from "../actions";
import { Card, Field, Flash, PageHeader, SelectField, SubmitButton, TextAreaField } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Add member" };

export default async function NewMemberPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/members");
  const params = await searchParams;

  return (
    <>
      <PageHeader title="Add member" description="Register a member or a first-time visitor." />
      <Flash error={firstParam(params.error)} />

      <form action={createMember} className="space-y-6">
        <Card title="Personal details">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="First name" name="first_name" required />
            <Field label="Last name" name="last_name" required />
            <Field label="Preferred name" name="preferred_name" />
            <Field label="Date of birth" name="date_of_birth" type="date" />
            <Field label="Phone" name="phone" type="tel" />
            <Field label="Email" name="email" type="email" />
          </div>
        </Card>

        <Card title="Address">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="md:col-span-2">
              <Field label="Street address" name="address_line_1" />
            </div>
            <Field label="City" name="city" />
            <Field label="State or region" name="region" />
            <Field label="Country" name="country" defaultValue="Nigeria" />
          </div>
        </Card>

        <Card title="Church details">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="Status"
              name="membership_status"
              defaultValue="active"
              options={[
                { value: "active", label: "Active member" },
                { value: "visitor", label: "Visitor" },
                { value: "inactive", label: "Inactive" },
                { value: "transferred", label: "Transferred" },
              ]}
            />
            <Field label="Date joined" name="join_date" type="date" />
            <label className="flex items-center gap-2 pt-7 text-sm font-medium text-foreground">
              <input type="checkbox" name="email_opt_in" defaultChecked />
              Happy to receive emails
            </label>
          </div>
          {can.pastoralNotes.includes(profile.role) && (
            <div className="mt-4">
              <TextAreaField label="Pastoral notes (private)" name="pastoral_notes" rows={3} />
            </div>
          )}
        </Card>

        <SubmitButton>Save member</SubmitButton>
      </form>
    </>
  );
}
