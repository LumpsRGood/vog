import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { access_code, record, validate_only } = await request.json();
    const expectedCode = Deno.env.get("STAFF_INTAKE_CODE");
    if (!expectedCode || access_code !== expectedCode) {
      return Response.json({ ok: false, error: "Invalid staff access code." }, { status: 401, headers: corsHeaders });
    }
    if (validate_only) {
      return Response.json({ ok: true, authorized: true }, { headers: corsHeaders });
    }
    if (!record?.name || !record?.date || !record?.state || !record?.city || !record?.store_number || !record?.issue) {
      return Response.json({ ok: false, error: "Please complete the required case fields." }, { status: 400, headers: corsHeaders });
    }

    const { notes, ...issueFields } = record;
    const { data, error } = await admin.from("issues").insert({ ...issueFields, notes, status: "New", priority: "Normal" }).select().single();
    if (error) throw error;

    if (notes?.trim()) {
      const { error: activityError } = await admin.from("activities").insert({
        issue_id: data.id,
        case_id: `VOG-${String(data.id).replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase()}`,
        activity_type: "Initial staff note",
        note: notes.trim(),
        staff_member: "Staff Intake",
      });
      if (activityError) throw activityError;
    }

    const syncUrl = `${supabaseUrl}/functions/v1/sync-issue-to-lists`;
    const syncResponse = await fetch(syncUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-vog-sync-secret": Deno.env.get("SYNC_WEBHOOK_SECRET") || "" },
      body: JSON.stringify({ type: "INSERT", table: "issues", record: data }),
    });
    if (!syncResponse.ok) throw new Error(`Lists sync failed: ${await syncResponse.text()}`);
    return Response.json({ ok: true, issue_id: data.id }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: error instanceof Error ? error.message : "Unable to create case." }, { status: 500, headers: corsHeaders });
  }
});
