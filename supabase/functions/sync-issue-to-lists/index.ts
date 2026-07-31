type IssueRecord = {
  id?: string | number;
  created_at?: string;
  name?: string;
  contact_type?: string;
  contact_method?: string;
  email?: string | null;
  phone?: string | null;
  date?: string | null;
  state?: string | null;
  city?: string | null;
  address?: string | null;
  store_number?: string | number | null;
  store_email?: string | null;
  intake_channel?: string | null;
  source?: string | null;
  issue?: string | null;
};

type SupabaseWebhookPayload = {
  type?: string;
  table?: string;
  record?: IssueRecord;
  old_record?: IssueRecord;
};

const graphBaseUrl = "https://graph.microsoft.com/v1.0";

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toIsoDateTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function caseId(record: IssueRecord) {
  const rawId = text(record.id || crypto.randomUUID()).replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  return `VOG-${new Date().getFullYear()}-${rawId.toUpperCase()}`;
}

async function getGraphToken() {
  const tenantId = requiredEnv("MS_TENANT_ID");
  const clientId = requiredEnv("MS_CLIENT_ID");
  const clientSecret = requiredEnv("MS_CLIENT_SECRET");
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Microsoft token request failed: ${response.status} ${await response.text()}`);
  }

  const json = await response.json();
  return json.access_token as string;
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

  if (!response.ok) {
    throw new Error(`Graph request failed: ${response.status} ${await response.text()}`);
  }

  return response.status === 204 ? null : response.json();
}

async function getSiteId(token: string) {
  const configured = Deno.env.get("MS_SITE_ID");
  if (configured) return configured;

  const hostname = requiredEnv("MS_SITE_HOSTNAME");
  const sitePath = requiredEnv("MS_SITE_PATH");
  const site = await graphFetch(token, `/sites/${hostname}:${sitePath}`);
  return site.id as string;
}

async function getListId(token: string, siteId: string, displayName: string) {
  const lists = await graphFetch(token, `/sites/${siteId}/lists?$select=id,displayName`);
  const list = lists.value.find((item: { displayName: string }) => item.displayName === displayName);
  if (!list) throw new Error(`Could not find Microsoft List: ${displayName}`);
  return list.id as string;
}

async function getColumnMap(token: string, siteId: string, listId: string) {
  const columns = await graphFetch(token, `/sites/${siteId}/lists/${listId}/columns?$select=name,displayName`);
  return new Map<string, string>(
    columns.value.map((column: { name: string; displayName: string }) => [column.displayName, column.name]),
  );
}

function setField(fields: Record<string, unknown>, columns: Map<string, string>, displayName: string, value: unknown) {
  const internalName = columns.get(displayName);
  if (internalName && value !== "") {
    fields[internalName] = value;
  }
}

function priorityFor(record: IssueRecord) {
  return record.contact_type === "celebration" ? "Normal" : "Normal";
}

async function createGuestCase(token: string, siteId: string, record: IssueRecord) {
  const listId = Deno.env.get("MS_GUEST_CASES_LIST_ID") || await getListId(token, siteId, "Guest Cases");
  const columns = await getColumnMap(token, siteId, listId);
  const storeNumber = text(record.store_number);
  const storeEmail = text(record.store_email) || (storeNumber ? `ihop${storeNumber}@opportunityrestaurantgroup.com` : "");

  const fields: Record<string, unknown> = {};
  setField(fields, columns, "Case ID", caseId(record));
  setField(fields, columns, "Submitted At", toIsoDateTime(record.created_at) || new Date().toISOString());
  setField(fields, columns, "Kind of Contact", record.contact_type === "celebration" ? "celebration" : "opportunity");
  setField(fields, columns, "Guest Name", text(record.name));
  setField(fields, columns, "Preferred Contact Method", text(record.contact_method));
  setField(fields, columns, "Guest Email", text(record.email));
  setField(fields, columns, "Guest Phone", text(record.phone));
  setField(fields, columns, "Incident Date", toIsoDateTime(record.date));
  setField(fields, columns, "Store Number", storeNumber);
  setField(fields, columns, "State", text(record.state));
  setField(fields, columns, "City", text(record.city));
  setField(fields, columns, "Address", text(record.address));
  setField(fields, columns, "Issue Description", text(record.issue));
  setField(fields, columns, "Status", "New");
  setField(fields, columns, "Priority", priorityFor(record));
  setField(fields, columns, "Source", text(record.source) || "voiceoftheguest.com");
  setField(fields, columns, "Intake Channel", text(record.intake_channel) || "Website Form");
  setField(fields, columns, "Store Email", storeEmail);
  setField(fields, columns, "Severity", "Normal");

  return graphFetch(token, `/sites/${siteId}/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("SYNC_WEBHOOK_SECRET");
  if (expectedSecret && request.headers.get("x-vog-sync-secret") !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await request.json() as SupabaseWebhookPayload;
    const record = payload.record;
    if (!record) {
      return Response.json({ ok: true, skipped: "No record in payload" });
    }

    const token = await getGraphToken();
    const siteId = await getSiteId(token);
    const item = await createGuestCase(token, siteId, record);

    return Response.json({ ok: true, listItemId: item?.id });
  } catch (error) {
    console.error(error);
    return Response.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
