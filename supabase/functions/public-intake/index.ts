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
    const { data, error } = await admin.from("issues").insert({ ...record, intake_channel: "Website Form", source: "voiceoftheguest.com" }).select().single();
    if (error) throw error;
    const sync = await fetch(`${url}/functions/v1/sync-issue-to-lists`, { method: "POST", headers: { "Content-Type": "application/json", "x-vog-sync-secret": Deno.env.get("SYNC_WEBHOOK_SECRET") || "" }, body: JSON.stringify({ type: "INSERT", table: "issues", record: data }) });
    if (!sync.ok) throw new Error(`Lists sync failed: ${await sync.text()}`);
    return Response.json({ ok: true, issue_id: data.id }, { headers: cors });
  } catch (error) { console.error(error); return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to submit report." }, { status: 500, headers: cors }); }
});
