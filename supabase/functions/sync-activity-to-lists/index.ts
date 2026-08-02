type ActivityRecord = { id?: string | number; case_id?: string | null; activity_type?: string | null; note?: string | null; staff_member?: string | null; activity_date?: string | null; guest_contacted?: string | null; direction?: string | null };
const graphBaseUrl = "https://graph.microsoft.com/v1.0";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vog-sync-secret", "Access-Control-Allow-Methods": "POST, OPTIONS" };
function requiredEnv(name: string) { const value = Deno.env.get(name); if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; }
function text(value: unknown) { return value === null || value === undefined ? "" : String(value); }
async function graphToken() { const body = new URLSearchParams({ client_id: requiredEnv("MS_CLIENT_ID"), client_secret: requiredEnv("MS_CLIENT_SECRET"), scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" }); const response = await fetch(`https://login.microsoftonline.com/${requiredEnv("MS_TENANT_ID")}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }); if (!response.ok) throw new Error(`Microsoft token request failed: ${response.status}`); return (await response.json()).access_token as string; }
async function graphFetch(token: string, path: string, init: RequestInit = {}) { const response = await fetch(`${graphBaseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json", ...(init.headers || {}) } }); if (!response.ok) throw new Error(`Graph request failed: ${response.status} ${await response.text()}`); return response.status === 204 ? null : response.json(); }
function setField(fields: Record<string, unknown>, map: Map<string, string>, displayName: string, value: unknown) { const internal = map.get(displayName); if (internal && value !== null && value !== undefined && value !== "") fields[internal] = value; }
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  const secret = Deno.env.get("SYNC_WEBHOOK_SECRET");
  if (secret && request.headers.get("x-vog-sync-secret") !== secret && !request.headers.get("authorization")?.startsWith("Bearer ")) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  try {
    const payload = await request.json() as { record?: ActivityRecord }; if (!payload.record) return Response.json({ ok: true, skipped: "No record in payload" }, { headers: corsHeaders });
    const token = await graphToken(); const site = await graphFetch(token, `/sites/${requiredEnv("MS_SITE_HOSTNAME")}:${requiredEnv("MS_SITE_PATH")}`);
    const lists = await graphFetch(token, `/sites/${site.id}/lists?$select=id,displayName`); const activityList = lists.value.find((item: { displayName: string }) => item.displayName === "Activities"); if (!activityList) throw new Error("Could not find Microsoft List: Activities");
    const cols = await graphFetch(token, `/sites/${site.id}/lists/${activityList.id}/columns?$select=name,displayName`); const map = new Map<string, string>(cols.value.map((c: { name: string; displayName: string }) => [c.displayName, c.name]));
    const a = payload.record; const fields: Record<string, unknown> = {};
    setField(fields, map, "Activity ID", text(a.id) || crypto.randomUUID()); setField(fields, map, "Case ID", text(a.case_id)); setField(fields, map, "Performed By", text(a.staff_member)); setField(fields, map, "Guest Contacted", text(a.guest_contacted)); setField(fields, map, "Activity Notes", text(a.note)); setField(fields, map, "Activity Date", a.activity_date || new Date().toISOString()); setField(fields, map, "Activity Type", text(a.activity_type) || "Note"); setField(fields, map, "Direction", text(a.direction));
    const item = await graphFetch(token, `/sites/${site.id}/lists/${activityList.id}/items`, { method: "POST", body: JSON.stringify({ fields }) }); return Response.json({ ok: true, listItemId: item?.id, mode: "graph" }, { headers: corsHeaders });
  } catch (error) { console.error(error); return Response.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500, headers: corsHeaders }); }
});
