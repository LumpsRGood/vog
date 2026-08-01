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
  store_name?: string | null;
  area_director?: string | null;
  regional_director?: string | null;
  intake_channel?: string | null;
  source?: string | null;
  issue?: string | null;
  case_url?: string | null;
};

type SupabaseWebhookPayload = {
  type?: string;
  table?: string;
  record?: IssueRecord;
  old_record?: IssueRecord;
};

const graphBaseUrl = "https://graph.microsoft.com/v1.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-vog-sync-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

function alertRawId(record: IssueRecord) {
  const existingId = text(record.id).replace(/[^A-Za-z0-9]/g, "");
  if (existingId) return existingId;
  return crypto.randomUUID().replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
}

function alertCaseId(rawId: string) {
  return `VOG-${rawId.toUpperCase()}`;
}

function guestCasesUrlFor(rawId: string) {
  const filterValue = encodeURIComponent(alertCaseId(rawId));
  return `https://opportunityrestaurantgroup.sharepoint.com/sites/GuestRelations/Lists/Guest%20Cases/AllItems.aspx?FilterField1=Title&FilterValue1=${filterValue}`;
}

function issueWithCaseLink(record: IssueRecord, rawId: string) {
  const issue = text(record.issue);
  const caseUrl = guestCasesUrlFor(rawId);
  if (issue.includes(caseUrl)) return issue;
  return `${issue}\n\nOpen case: ${caseUrl}`.trim();
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

function normalizedContactType(value: unknown) {
  const contactType = text(value).toLowerCase();
  if (contactType === "celebration") return "Celebration";
  if (contactType === "complaint") return "Complaint";
  if (contactType === "question") return "Question";
  return "Opportunity";
}

function normalizedContactMethod(value: unknown) {
  const method = text(value).toLowerCase();
  if (method === "phone") return "Phone";
  if (method === "text") return "Text";
  return "Email";
}

function listsPayload(record: IssueRecord): SupabaseWebhookPayload {
  const storeNumber = text(record.store_number);
  const rawId = alertRawId(record);

  return {
    type: "INSERT",
    table: "issues",
    record: {
      ...record,
      id: rawId,
      contact_type: normalizedContactType(record.contact_type),
      contact_method: normalizedContactMethod(record.contact_method),
      store_number: storeNumber,
      store_email: text(record.store_email) || (storeNumber ? `ihop${storeNumber}@opportunityrestaurantgroup.com` : ""),
      source: text(record.source) || "voiceoftheguest.com",
      intake_channel: text(record.intake_channel) || "Website Form",
      case_url: guestCasesUrlFor(rawId),
      issue: issueWithCaseLink(record, rawId),
    },
  };
}

async function createGuestCaseViaPowerAutomate(record: IssueRecord) {
  const flowUrl = Deno.env.get("POWER_AUTOMATE_SYNC_URL");
  if (!flowUrl) return null;

  const response = await fetch(flowUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-vog-sync-secret": Deno.env.get("SYNC_WEBHOOK_SECRET") || "",
    },
    body: JSON.stringify(listsPayload(record)),
  });

  if (!response.ok) {
    throw new Error(`Power Automate request failed: ${response.status} ${await response.text()}`);
  }

  return { id: "power-automate-flow", status: response.status };
}

async function createGuestCase(token: string, siteId: string, record: IssueRecord) {
  const listId = Deno.env.get("MS_GUEST_CASES_LIST_ID") || await getListId(token, siteId, "Guest Cases");
  const columns = await getColumnMap(token, siteId, listId);
  const storeNumber = text(record.store_number);
  const storeEmail = text(record.store_email) || (storeNumber ? `ihop${storeNumber}@opportunityrestaurantgroup.com` : "");
  const submittedAt = toIsoDateTime(record.created_at) || new Date().toISOString();
  const incidentDate = toIsoDateTime(record.date);
  const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const fields: Record<string, unknown> = {};
  setField(fields, columns, "Case ID", caseId(record));
  setField(fields, columns, "Submitted At", submittedAt);
  setField(fields, columns, "Contact Type", normalizedContactType(record.contact_type));
  setField(fields, columns, "Guest Name", text(record.name));
  setField(fields, columns, "Preferred Contact Method", normalizedContactMethod(record.contact_method));
  setField(fields, columns, "Guest Email", text(record.email));
  setField(fields, columns, "Guest Phone", text(record.phone));
  setField(fields, columns, "Incident Date", incidentDate);
  setField(fields, columns, "Store Number", storeNumber);
  setField(fields, columns, "Store Name", text(record.store_name) || (storeNumber ? `IHOP ${storeNumber}` : ""));
  setField(fields, columns, "State", text(record.state));
  setField(fields, columns, "City", text(record.city));
  setField(fields, columns, "Address", text(record.address));
  setField(fields, columns, "Issue Description", text(record.issue));
  setField(fields, columns, "Status", "New");
  setField(fields, columns, "Priority", priorityFor(record));
  setField(fields, columns, "Case Category", normalizedContactType(record.contact_type) === "Celebration" ? "Staff Recognition" : "Other");
  setField(fields, columns, "Source", text(record.source) || "voiceoftheguest.com");
  setField(fields, columns, "Intake Channel", text(record.intake_channel) || "Website Form");
  setField(fields, columns, "Store Email", storeEmail);
  setField(fields, columns, "Area Director", text(record.area_director));
  setField(fields, columns, "Regional Director", text(record.regional_director));
  setField(fields, columns, "Severity", "Normal");
  setField(fields, columns, "Due Date", dueDate);
  setField(fields, columns, "Reopened", "No");
  setField(fields, columns, "Supabase ID", text(record.id));

  return graphFetch(token, `/sites/${siteId}/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const expectedSecret = Deno.env.get("SYNC_WEBHOOK_SECRET");
  const hasValidSecret = expectedSecret && request.headers.get("x-vog-sync-secret") === expectedSecret;
  const hasSupabaseAuth = request.headers.get("authorization")?.startsWith("Bearer ");
  if (expectedSecret && !hasValidSecret && !hasSupabaseAuth) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const payload = await request.json() as SupabaseWebhookPayload;
    const record = payload.record;
    if (!record) {
      return Response.json({ ok: true, skipped: "No record in payload" }, { headers: corsHeaders });
    }

    try {
      const token = await getGraphToken();
      const siteId = await getSiteId(token);
      const item = await createGuestCase(token, siteId, record);

      return Response.json({ ok: true, listItemId: item?.id, mode: "graph" }, { headers: corsHeaders });
    } catch (graphError) {
      console.error("Graph sync failed; trying Power Automate fallback", graphError);
      const flowItem = await createGuestCaseViaPowerAutomate(record);
      if (flowItem) {
        return Response.json(
          {
            ok: true,
            listItemId: flowItem.id,
            mode: "power-automate",
            graphError: graphError instanceof Error ? graphError.message : String(graphError),
          },
          { headers: corsHeaders },
        );
      }
      throw graphError;
    }
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders },
    );
  }
});
