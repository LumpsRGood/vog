import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';

type IssueRow = {
  id: string;
  created_at: string;
  name: string | null;
  contact_type: string | null;
  contact_method: string | null;
  state: string | null;
  city: string | null;
  store_number: string | null;
  issue: string | null;
  lists_sync_status: string | null;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-dashboard-token',
};

function countBy(rows: IssueRow[], key: keyof IssueRow, limit = 8) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const label = String(row[key] || 'Unknown');
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const expectedToken = Deno.env.get('DASHBOARD_TOKEN');
  const providedToken = request.headers.get('x-dashboard-token')?.trim() ?? '';

  if (!expectedToken || providedToken !== expectedToken) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from('issues')
    .select('id, created_at, name, contact_type, contact_method, state, city, store_number, issue')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rows = (data ?? []) as IssueRow[];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const metrics = {
    totalCases: rows.length,
    last7Days: rows.filter((row) => Date.parse(row.created_at) >= sevenDaysAgo).length,
    last30Days: rows.filter((row) => Date.parse(row.created_at) >= thirtyDaysAgo).length,
    opportunities: rows.filter((row) => row.contact_type === 'opportunity').length,
    celebrations: rows.filter((row) => row.contact_type === 'celebration').length,
    syncedToLists: rows.filter((row) => row.lists_sync_status === 'synced').length,
    pendingListsSync: rows.filter((row) => row.lists_sync_status !== 'synced').length,
    byState: countBy(rows, 'state'),
    byStore: countBy(rows, 'store_number'),
    byContactType: countBy(rows, 'contact_type'),
    byContactMethod: countBy(rows, 'contact_method'),
    recentCases: rows.slice(0, 12).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      name: row.name ?? '',
      contact_type: row.contact_type ?? '',
      contact_method: row.contact_method ?? '',
      state: row.state ?? '',
      city: row.city ?? '',
      store_number: row.store_number ?? '',
      issue: row.issue ?? '',
      lists_sync_status: row.lists_sync_status,
    })),
    generatedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(metrics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
