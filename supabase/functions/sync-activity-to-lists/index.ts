type ActivityRecord = {
  id?: string | number;
  case_id?: string | null;
  activity_type?: string | null;
  note?: string | null;
  staff_member?: string | null;
  activity_date?: string | null;
  guest_contacted?: string | boolean | null;
  direction?: string | null;
  next_action?: string | null;
  next_follow_up_date?: string | null;
};

const graphBaseUrl = "https://graph.microsoft.com/v1.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vog-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function text(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

async function sendToPowerAutomate(record: ActivityRecord) {
  const url = Deno.env.get("POWER_AUTOMATE_ACTIVITY_SYNC_URL");
  if (!url) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-vog-sync-secret": requiredEnv("SYNC_WEBHOOK_SECRET"),
    },
    body: JSON.stringify({ type: "INSERT", table: "activities", record }),
  });
  if (!response.ok) {
    throw new Error(`Power Automate activity sync failed: ${response.status} ${await response.text()}`);
  }
  return { ok: true, mode: "power-automate", status: response.status };
}

async function graphToken() {
  const body = new URLSearchParams({
    client_id: requiredEnv("MS_CLIENT_ID"),
    client_secret: requiredEnv("MS_CLIENT_SECRET"),
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });
  const response = await fetch(
    `https://login.microsoftonline.com/${requiredEnv("MS_TENANT_ID")}/oauth2/v2.0/token`,
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
  );
  if (!response.ok) throw new Error(`Microsoft token request failed: ${response.status}`);
  return (await response.json()).access_token as string;
}

async function graphFetch(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${graphBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Graph request failed: ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

function setField(fields: Record<string, unknown>, map: Map<string, string>, displayName: string, value: unknown) {
  const internal = map.get(displayName.trim().toLowerCase());
  if (internal && value !== null && value !== undefined && value !== "") fields[internal] = value;
}

async function sendToGraph(a: ActivityRecord) {
  const token = await graphToken();
  const site = await graphFetch(token, `/sites/${requiredEnv("MS_SITE_HOSTNAME")}:${requiredEnv("MS_SITE_PATH")}`);
  const lists = await graphFetch(token, `/sites/${site.id}/lists?$select=id,displayName`);
  const activityList = lists.value.find((item: { displayName: string }) => item.displayName === "Activities");
  if (!activityList) throw new Error("Could not find Microsoft List: Activities");

  const cols = await graphFetch(token, `/sites/${site.id}/lists/${activityList.id}/columns?$select=name,displayName`);
  const map = new Map<string, string>(
    cols.value.map((c: { name: string; displayName: string }) => [c.displayName.trim().toLowerCase(), c.name]),
  );
  const fields: Record<string, unknown> = {};
  setField(fields, map, "Activity ID", text(a.id) || crypto.randomUUID());
  setField(fields, map, "Case ID", text(a.case_id));
  setField(fields, map, "Activity Type", text(a.activity_type));
  setField(fields, map, "Performed By", text(a.staff_member));
  setField(fields, map, "Direction", text(a.direction));
  setField(fields, map, "Guest Contacted", a.guest_contacted);
  setField(fields, map, "Activity Notes", text(a.note));
  setField(fields, map, "Next Action", text(a.next_action));
  setField(fields, map, "Next Follow-up Date", a.next_follow_up_date);
  setField(fields, map, "Activity Date", a.activity_date || new Date().toISOString());

  const item = await graphFetch(token, `/sites/${site.id}/lists/${activityList.id}/items`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
  return { ok: true, listItemId: item?.id, mode: "graph" };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const secret = Deno.env.get("SYNC_WEBHOOK_SECRET");
  const hasBearer = request.headers.get("authorization")?.startsWith("Bearer ");
  if (secret && request.headers.get("x-vog-sync-secret") !== secret && !hasBearer) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await request.json() as { record?: ActivityRecord };
    if (!payload.record) {
      return Response.json({ ok: true, skipped: "No record in payload" }, { headers: corsHeaders });
    }
    const result = await sendToPowerAutomate(payload.record) || await sendToGraph(payload.record);
    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders },
    );
  }
});
