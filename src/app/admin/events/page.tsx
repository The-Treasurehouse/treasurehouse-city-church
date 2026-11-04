import type { Metadata } from "next";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam, formatDateTime } from "@/lib/format";
import { createEvent } from "./actions";
import { Badge, Card, Field, Flash, PageHeader, SubmitButton, Table, TextAreaField, td } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/events");
  const params = await searchParams;
  const db = createAdminClient();

  const { data: events } = await db
    .from("events")
    .select("id, title, starts_at, location, capacity, rsvp_enabled, event_rsvps(count)")
    .eq("organization_id", profile.organizationId)
    .order("starts_at", { ascending: false })
    .limit(50);

  const now = new Date().getTime();

  return (
    <>
      <PageHeader title="Events" description="Programmes and gatherings, with RSVPs." />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Table head={["Event", "When", "Where", "RSVPs", "Status"]} empty="No events yet.">
            {(events ?? []).map((e) => (
              <tr key={e.id}>
                <td className={`${td} font-semibold`}>{e.title}</td>
                <td className={td}>{formatDateTime(e.starts_at)}</td>
                <td className={td}>{e.location}</td>
                <td className={td}>
                  {e.rsvp_enabled ? (
                    <>
                      {e.event_rsvps?.[0]?.count ?? 0}
                      {e.capacity ? ` / ${e.capacity}` : ""}
                    </>
                  ) : (
                    <span className="text-muted">Off</span>
                  )}
                </td>
                <td className={td}>
                  <Badge tone={new Date(e.starts_at).getTime() >= now ? "success" : "neutral"}>
                    {new Date(e.starts_at).getTime() >= now ? "Upcoming" : "Past"}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {can.manageEvents.includes(profile.role) && (
          <Card title="New event">
            <form action={createEvent} className="space-y-4">
              <Field label="Title" name="title" required />
              <Field label="Starts" name="starts_at" type="datetime-local" required />
              <Field label="Location" name="location" />
              <Field label="Capacity" name="capacity" type="number" />
              <TextAreaField label="Description" name="description" rows={3} />
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input type="checkbox" name="rsvp_enabled" defaultChecked /> Allow RSVPs
              </label>
              <SubmitButton>Create event</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
