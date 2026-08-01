import React from 'react';
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Lock,
  MapPin,
  RefreshCcw,
  Store,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type MetricRow = {
  label: string;
  value: number;
};

type RecentCase = {
  id: string;
  created_at: string;
  name: string;
  contact_type: string;
  contact_method: string;
  state: string;
  city: string;
  store_number: string;
  issue: string;
  lists_sync_status?: string | null;
};

type DashboardMetrics = {
  totalCases: number;
  last7Days: number;
  last30Days: number;
  opportunities: number;
  celebrations: number;
  syncedToLists: number;
  pendingListsSync: number;
  byState: MetricRow[];
  byStore: MetricRow[];
  byContactType: MetricRow[];
  byContactMethod: MetricRow[];
  recentCases: RecentCase[];
  generatedAt: string;
};

const emptyMetrics: DashboardMetrics = {
  totalCases: 0,
  last7Days: 0,
  last30Days: 0,
  opportunities: 0,
  celebrations: 0,
  syncedToLists: 0,
  pendingListsSync: 0,
  byState: [],
  byStore: [],
  byContactType: [],
  byContactMethod: [],
  recentCases: [],
  generatedAt: '',
};

function formatLabel(value: string) {
  if (!value) return 'Unknown';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function BarList({ rows }: { rows: MetricRow[] }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  if (rows.length === 0) {
    return <p className="text-sm text-stone-500">No cases yet.</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate font-medium text-stone-700">{formatLabel(row.label)}</span>
            <span className="tabular-nums text-stone-500">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.max((row.value / max) * 100, 8)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const [accessCode, setAccessCode] = React.useState(() => sessionStorage.getItem('vog-dashboard-token') ?? '');
  const [draftCode, setDraftCode] = React.useState(accessCode);
  const [metrics, setMetrics] = React.useState<DashboardMetrics>(emptyMetrics);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadMetrics = React.useCallback(async () => {
    if (!supabase || !accessCode) return;

    setIsLoading(true);
    setError('');

    const { data, error: functionError } = await supabase.functions.invoke<DashboardMetrics>('dashboard-metrics', {
      headers: {
        'x-dashboard-token': accessCode,
      },
    });

    if (functionError) {
      setError('Dashboard access is not ready yet or the access code is wrong.');
      setMetrics(emptyMetrics);
    } else {
      setMetrics(data ?? emptyMetrics);
    }

    setIsLoading(false);
  }, [accessCode]);

  React.useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const saveAccessCode = (event: React.FormEvent) => {
    event.preventDefault();
    sessionStorage.setItem('vog-dashboard-token', draftCode);
    setAccessCode(draftCode);
  };

  if (!accessCode) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-stone-900 text-white">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Reporting Dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Enter the internal dashboard access code to view guest case reporting.
          </p>
          <form onSubmit={saveAccessCode} className="mt-6 space-y-4">
            <input
              type="password"
              value={draftCode}
              onChange={(event) => setDraftCode(event.target.value)}
              className="w-full rounded-lg border border-stone-300 px-4 py-2 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900"
              placeholder="Access code"
              required
            />
            <button className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800">
              <Lock className="h-4 w-4" />
              Open dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">Voice of the Guest</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-stone-950">Reporting Dashboard</h2>
          <p className="mt-2 text-sm text-stone-500">
            Website submissions, list sync health, and store-level guest trends.
          </p>
        </div>
        <button
          onClick={loadMetrics}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
        >
          <RefreshCcw className="h-4 w-4" />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">{error}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('vog-dashboard-token');
                setAccessCode('');
                setDraftCode('');
              }}
              className="mt-2 font-medium underline"
            >
              Re-enter access code
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Cases', value: metrics.totalCases, icon: BarChart3 },
          { label: 'Last 7 Days', value: metrics.last7Days, icon: CalendarClock },
          { label: 'Opportunities', value: metrics.opportunities, icon: AlertCircle },
          { label: 'Celebrations', value: metrics.celebrations, icon: CheckCircle2 },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-500">{item.label}</p>
              <item.icon className="h-4 w-4 text-stone-400" />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-stone-950">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <h3 className="font-semibold text-stone-900">Cases By State</h3>
          </div>
          <BarList rows={metrics.byState} />
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Store className="h-4 w-4 text-emerald-700" />
            <h3 className="font-semibold text-stone-900">Top Stores</h3>
          </div>
          <BarList rows={metrics.byStore} />
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-700" />
            <h3 className="font-semibold text-stone-900">Contact Mix</h3>
          </div>
          <BarList rows={metrics.byContactType} />
          <div className="mt-6 border-t border-stone-100 pt-5">
            <BarList rows={metrics.byContactMethod} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h3 className="font-semibold text-stone-900">Recent Cases</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {metrics.recentCases.length === 0 ? (
            <p className="p-5 text-sm text-stone-500">No recent cases yet.</p>
          ) : (
            metrics.recentCases.map((guestCase) => (
              <article key={guestCase.id} className="grid gap-3 p-5 lg:grid-cols-[180px_1fr_160px]">
                <div>
                  <p className="text-sm font-semibold text-stone-900">VOG-{guestCase.id.slice(0, 8).toUpperCase()}</p>
                  <p className="mt-1 text-xs text-stone-500">{formatDate(guestCase.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-900">{guestCase.name || 'Guest'}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{guestCase.issue}</p>
                  <p className="mt-2 text-xs font-medium text-stone-500">
                    Store {guestCase.store_number || 'Unknown'} | {guestCase.city || 'Unknown'}, {guestCase.state || 'Unknown'}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                    {formatLabel(guestCase.contact_type)}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    Website form
                  </span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {metrics.generatedAt && (
        <p className="mt-4 text-right text-xs text-stone-400">Updated {formatDate(metrics.generatedAt)}</p>
      )}
    </main>
  );
}
