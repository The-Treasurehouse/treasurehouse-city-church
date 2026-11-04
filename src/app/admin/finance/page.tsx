import type { Metadata } from "next";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam, formatNaira, formatShortDate } from "@/lib/format";
import { createFund, recordGiving } from "./actions";
import { Badge, Card, Field, Flash, PageHeader, SelectField, StatCard, SubmitButton, Table, td } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Giving" };

export default async function GivingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/finance");
  const params = await searchParams;
  const db = createAdminClient();
  const org = profile.organizationId;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const canRecord = can.recordGiving.includes(profile.role);

  const [{ data: monthRows }, { data: rows }, { data: funds }, { data: members }] = await Promise.all([
    db
      .from("giving_records")
      .select("amount, giving_type")
      .eq("organization_id", org)
      .gte("received_at", monthStart.toISOString()),
    db
      .from("giving_records")
      .select("id, amount, currency, giving_type, payment_method, received_at, receipt_number, reference, members(first_name, last_name), funds(name)")
      .eq("organization_id", org)
      .order("received_at", { ascending: false })
      .limit(100),
    db.from("funds").select("id, name").eq("organization_id", org).eq("is_active", true).order("name"),
    canRecord
      ? db
          .from("members")
          .select("id, first_name, last_name")
          .eq("organization_id", org)
          .in("membership_status", ["active", "visitor"])
          .order("last_name")
          .limit(300)
      : Promise.resolve({ data: [] }),
  ]);

  const total = (monthRows ?? []).reduce((a, r) => a + Number(r.amount), 0);
  const sumOf = (type: string) =>
    (monthRows ?? []).filter((r) => r.giving_type === type).reduce((a, r) => a + Number(r.amount), 0);

  return (
    <>
      <PageHeader title="Giving" description="Tithes, offerings and donations with receipts. Gifts are recorded, never edited or deleted." />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Given this month" value={formatNaira(total)} />
        <StatCard label="Tithes" value={formatNaira(sumOf("tithe"))} />
        <StatCard label="Offerings" value={formatNaira(sumOf("offering"))} />
        <StatCard label="Donations" value={formatNaira(sumOf("donation"))} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table head={["Date", "Type", "From", "Fund", "Amount", "Receipt"]} empty="No gifts recorded yet.">
            {(rows ?? []).map((r) => {
              const m = Array.isArray(r.members) ? r.members[0] : r.members;
              const f = Array.isArray(r.funds) ? r.funds[0] : r.funds;
              return (
                <tr key={r.id}>
                  <td className={td}>{formatShortDate(r.received_at)}</td>
                  <td className={td}>
                    <Badge tone="neutral">{r.giving_type}</Badge>
                    <span className="mt-1 block text-xs capitalize text-muted">{r.payment_method}</span>
                  </td>
                  <td className={td}>{m ? `${m.first_name} ${m.last_name}` : "Anonymous"}</td>
                  <td className={td}>{f?.name}</td>
                  <td className={`${td} font-semibold`}>{formatNaira(r.amount)}</td>
                  <td className={`${td} text-xs text-muted`}>{r.receipt_number}</td>
                </tr>
              );
            })}
          </Table>
        </div>

        {canRecord && (
          <div className="space-y-6">
            <Card title="Record a gift">
              <form action={recordGiving} className="space-y-4">
                <SelectField
                  label="Type"
                  name="giving_type"
                  required
                  defaultValue="offering"
                  options={[
                    { value: "tithe", label: "Tithe" },
                    { value: "offering", label: "Offering" },
                    { value: "donation", label: "Donation" },
                    { value: "pledge", label: "Pledge payment" },
                    { value: "other", label: "Other" },
                  ]}
                />
                <Field label="Amount (NGN)" name="amount" type="number" step="0.01" required />
                <SelectField
                  label="Method"
                  name="payment_method"
                  defaultValue="cash"
                  options={[
                    { value: "cash", label: "Cash" },
                    { value: "transfer", label: "Bank transfer" },
                    { value: "online", label: "Online" },
                    { value: "pos", label: "POS" },
                  ]}
                />
                <SelectField
                  label="Given by (optional)"
                  name="member_id"
                  placeholder="Anonymous"
                  options={(members ?? []).map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))}
                />
                <SelectField
                  label="Fund (optional)"
                  name="fund_id"
                  placeholder="General"
                  options={(funds ?? []).map((f) => ({ value: f.id, label: f.name }))}
                />
                <Field label="Date" name="received_at" type="date" />
                <Field label="Payment reference" name="reference" />
                <Field label="Note" name="note" />
                <SubmitButton>Record gift</SubmitButton>
              </form>
            </Card>

            <Card title="New fund">
              <form action={createFund} className="space-y-4">
                <Field label="Name" name="name" required placeholder="Building project" />
                <Field label="Code (optional)" name="code" />
                <SubmitButton>Create fund</SubmitButton>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
