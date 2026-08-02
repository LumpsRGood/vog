import { supabaseAnonKey, supabaseUrl } from './supabase';

type IntakeResponse = {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
};

export async function submitIntake(functionName: 'public-intake' | 'staff-intake', body: Record<string, unknown>) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('The intake service is not configured. Please contact Guest Relations.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as IntakeResponse;
  if (!response.ok || !data.ok) {
    throw new Error(data.error || `The intake service returned an error (${response.status}).`);
  }

  return data;
}
