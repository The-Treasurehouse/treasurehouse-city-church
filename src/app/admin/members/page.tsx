import type { Metadata } from "next";
import Link from "next/link";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { searchTerm } from "@/lib/actions";
import { can } from "@/lib/permissions";
import { firstParam, formatShortDate } from "@/lib/format";
import { Badge, Flash, LinkButton, PageHeader, Table, td, inputClass } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Members" };

const statusTone = {
  active: "success",
  visitor: "accent",
  inactive: "warning",
  transferred: "neutral",
  deceased: "neutral",
} as const;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/members");
  const params = await searchParams;
  const q = searchTerm(firstParam(params.q));
  const status = firstParam(params.status) ?? "";

  const db = createAdminClient();
  let query = db
    .from("members")
    .select("id, first_name, last_name, preferred_name, phone, email, membership_status, join_date")
    .eq("organization_id", profile.organizationId)
    .order("last_name")
    .limit(200);
  if (q) {
    query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
  }
  if (status) query = query.eq("membership_status", status);
  const { data: members } = await query;

  return (
    <>
      <PageHeader
        title="Members"
        description="Directory of members and visitors."
        action={
          can.manageMembers.includes(profile.role) ? <LinkButton href="/admin/members/new">Add member</LinkButton> : undefined
        }
      />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <form className="mb-5 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone or email"
          className={`${inputClass} mt-0 max-w-sm`}
        />
        <select name="status" defaultValue={status} className={`${inputClass} mt-0 w-auto`}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="visitor">Visitors</option>
          <option value="inactive">Inactive</option>
          <option value="transferred">Transferred</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Filter
        </button>
      </form>

      <Table head={["Name", "Phone", "Email", "Status", "Joined"]} empty="No members found.">
        {(members ?? []).map((m) => (
          <tr key={m.id} className="hover:bg-surface">
            <td className={td}>
              <Link href={`/admin/members/${m.id}`} className="font-semibold hover:text-accent-ink">
                {m.first_name} {m.last_name}
              </Link>
              {m.preferred_name && <span className="ml-2 text-muted">({m.preferred_name})</span>}
            </td>
            <td className={td}>{m.phone}</td>
            <td className={td}>{m.email}</td>
            <td className={td}>
              <Badge tone={statusTone[m.membership_status as keyof typeof statusTone]}>{m.membership_status}</Badge>
            </td>
            <td className={td}>{formatShortDate(m.join_date)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
