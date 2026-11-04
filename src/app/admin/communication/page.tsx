import type { Metadata } from "next";
import { requireAccess } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/permissions";
import { firstParam, formatDateTime } from "@/lib/format";
import { createAnnouncement } from "./actions";
import { Badge, Card, Field, Flash, PageHeader, SelectField, SubmitButton, TextAreaField } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Communication" };

export default async function CommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireAccess("/admin/communication");
  const params = await searchParams;
  const db = createAdminClient();

  const [{ data: announcements }, { data: groups }] = await Promise.all([
    db
      .from("announcements")
      .select("id, title, body, audience_type, audience_reference_id, publish_at")
      .eq("organization_id", profile.organizationId)
      .order("publish_at", { ascending: false })
      .limit(30),
    db.from("groups").select("id, name").eq("organization_id", profile.organizationId).eq("is_active", true).order("name"),
  ]);

  const groupName = new Map((groups ?? []).map((g) => [g.id, g.name]));
  const now = new Date().getTime();

  return (
    <>
      <PageHeader
        title="Communication"
        description="Write announcements for the whole church or one group. Email delivery is not connected yet, so these are recorded and shown in the member app later."
      />
      <Flash error={firstParam(params.error)} notice={firstParam(params.notice)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {(announcements ?? []).length === 0 && (
            <p className="rounded-xl border border-border bg-card px-5 py-10 text-center text-sm text-muted">
              No announcements yet.
            </p>
          )}
          {(announcements ?? []).map((a) => {
            const scheduled = new Date(a.publish_at).getTime() > now;
            return (
              <Card key={a.id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{a.title}</h3>
                  <Badge tone={scheduled ? "warning" : "success"}>{scheduled ? "scheduled" : "published"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {a.audience_type === "group" && a.audience_reference_id
                    ? (groupName.get(a.audience_reference_id) ?? "Group")
                    : "Whole church"}{" "}
                  · {formatDateTime(a.publish_at)}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm text-foreground">{a.body}</p>
              </Card>
            );
          })}
        </div>

        {can.manageAnnouncements.includes(profile.role) && (
          <Card title="New announcement">
            <form action={createAnnouncement} className="space-y-4">
              <Field label="Title" name="title" required />
              <TextAreaField label="Message" name="body" rows={5} required />
              <SelectField
                label="Audience"
                name="group_id"
                placeholder="Whole church"
                options={(groups ?? []).map((g) => ({ value: g.id, label: g.name }))}
              />
              <Field label="Publish at (leave empty for now)" name="publish_at" type="datetime-local" />
              <SubmitButton>Save</SubmitButton>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
