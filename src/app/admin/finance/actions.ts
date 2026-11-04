"use server";

import { revalidatePath } from "next/cache";
import { actionContext, audit, backTo, num, text } from "@/lib/actions";
import { can } from "@/lib/permissions";

const HREF = "/admin/finance";
const GIVING_TYPES = ["tithe", "offering", "donation", "pledge", "other"];

function receiptNumber() {
  const d = new Date();
  const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RCP-${day}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function recordGiving(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.recordGiving);
  const type = text(form, "giving_type");
  const amount = num(form, "amount");
  if (!type || !GIVING_TYPES.includes(type) || amount === null || amount <= 0) {
    backTo(HREF, { error: "Choose a type and enter an amount above zero." });
  }

  const receipt = receiptNumber();
  const received = text(form, "received_at");
  const { data, error } = await db
    .from("giving_records")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      member_id: text(form, "member_id"),
      fund_id: text(form, "fund_id"),
      amount,
      currency: "NGN",
      giving_type: type,
      payment_method: text(form, "payment_method") ?? "cash",
      received_at: received ? new Date(received).toISOString() : new Date().toISOString(),
      reference: text(form, "reference"),
      note: text(form, "note"),
      receipt_number: receipt,
      created_by_profile_id: profile.id,
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not record this gift." });

  await audit(db, profile, "giving.record", "giving_record", data.id, { amount, type, receipt });
  revalidatePath(HREF);
  backTo(HREF, { notice: `Recorded, receipt ${receipt}` });
}

export async function createFund(form: FormData) {
  const { profile, db } = await actionContext(HREF, can.recordGiving);
  const name = text(form, "name");
  if (!name) backTo(HREF, { error: "Give the fund a name." });

  const { data, error } = await db
    .from("funds")
    .insert({
      organization_id: profile.organizationId,
      branch_id: profile.branchId,
      name,
      code: text(form, "code"),
    })
    .select("id")
    .single();
  if (error || !data) backTo(HREF, { error: "Could not create the fund." });

  await audit(db, profile, "fund.create", "fund", data.id);
  revalidatePath(HREF);
  backTo(HREF, { notice: "Fund created" });
}
