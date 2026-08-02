import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  try {
    const record = await request.json();
    if (!record?.name || !record?.date || !record?.state || !record?.city || !record?.store_number || !record?.issue) return Response.json({ ok: false, error: "Please complete all required fields." }, { status: 400, headers: cors });
    const issueFields = {
      name: record.name,
      contact_type: record.contact_type,
      contact_method: record.contact_method,
      email: record.email || null,
      phone: record.phone || null,
      date: record.date,
      state: record.state,
      city: record.city,
      address: record.address || null,
      store_number: record.store_number,
      store_email: record.store_email || null,
      intake_channel: "Website Form",
      source: "voiceoftheguest.com",
      issue: record.issue,
    };
    const { data, error } = await admin.from("issues").insert(issueFields).select().single();
    if (error) throw error;
    const syncRecord = { ...record, ...data };
    const sync = await fetch(`${url}/functions/v1/sync-issue-to-lists`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`, "x-vog-sync-secret": Deno.env.get("SYNC_WEBHOOK_SECRET") || "" }, body: JSON.stringify({ type: "INSERT", table: "issues", record: syncRecord }) });
    if (!sync.ok) {
      console.error("Lists sync failed after intake was saved", await sync.text());
      return Response.json({ ok: true, issue_id: data.id, sync_pending: true }, { headers: cors });
    }
    return Response.json({ ok: true, issue_id: data.id }, { headers: cors });
  } catch (error) { console.error(error); const message = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : "Unable to submit report."; return Response.json({ ok: false, error: message }, { status: 200, headers: cors }); }
});
