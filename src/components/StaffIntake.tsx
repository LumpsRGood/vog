import React, { useMemo } from 'react';
import { ArrowLeft, CheckCircle2, LockKeyhole, Send } from 'lucide-react';
import { StaffIssue } from '../types';
import { STORE_LOCATIONS, STATE_OPTIONS } from '../data/locations';
import { submitIntake } from '../lib/intake';

const CATEGORIES = {
  Service: ['Wait time', 'Order accuracy', 'Hospitality', 'Cleanliness'],
  Food: ['Food quality', 'Temperature', 'Missing item', 'Food safety'],
  Billing: ['Charge issue', 'Refund request', 'Gift card', 'Other billing'],
  Recognition: ['Great service', 'Great food', 'Team recognition', 'Manager recognition'],
  Other: ['General feedback', 'Question', 'Unknown / needs review'],
} as const;

const emptyForm: StaffIssue = {
  name: '', contactType: 'opportunity', contactMethod: 'email', email: '', phone: '',
  date: '', state: '', city: '', address: '', storeNumber: '', issue: '',
  issueCategory: 'Other', issueSubcategory: 'General feedback',
  staffAccessCode: '', intakeChannel: 'Staff Intake - Phone', initialNotes: '',
};

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return <label className="space-y-2 block"><span className="text-sm font-medium text-stone-700">{label}{required ? ' *' : ''}</span>{children}</label>;
}

const inputClass = 'w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-900 focus:border-stone-900 outline-none bg-white';

export function StaffIntake() {
  const [formData, setFormData] = React.useState<StaffIssue>(emptyForm);
  const [authorized, setAuthorized] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  const availableCities = useMemo(() => formData.state
    ? [...new Set(STORE_LOCATIONS.filter(l => l.state === formData.state).map(l => l.city))].sort()
    : [], [formData.state]);
  const availableLocations = useMemo(() => STORE_LOCATIONS.filter(l => l.state === formData.state && l.city === formData.city), [formData.state, formData.city]);
  const selectedLocation = STORE_LOCATIONS.find(l => l.storeNumber === formData.storeNumber);
  const subcategories = CATEGORIES[formData.issueCategory as keyof typeof CATEGORIES] ?? CATEGORIES.Other;

  const update = (name: string, value: string) => setFormData(prev => {
    const next = { ...prev, [name]: value } as StaffIssue;
    if (name === 'state') { next.city = ''; next.storeNumber = ''; next.address = ''; }
    if (name === 'city') { next.storeNumber = ''; next.address = ''; }
    if (name === 'storeNumber') next.address = STORE_LOCATIONS.find(l => l.storeNumber === value)?.address ?? '';
    if (name === 'issueCategory') next.issueSubcategory = (CATEGORIES[value as keyof typeof CATEGORIES] ?? CATEGORIES.Other)[0];
    return next;
  });

  const authorize = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!formData.staffAccessCode.trim()) return setError('Enter the staff access code.');
    try {
      await submitIntake('staff-intake', { access_code: formData.staffAccessCode, validate_only: true });
      setAuthorized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The staff intake service could not verify this code. Please try again.');
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true); setError('');
    try {
      await submitIntake('staff-intake', {
          access_code: formData.staffAccessCode,
          record: {
            name: formData.name, contact_type: formData.contactType, contact_method: formData.contactMethod,
            email: formData.email || null, phone: formData.phone || null, date: formData.date,
            state: formData.state, city: formData.city, address: formData.address, store_number: formData.storeNumber,
            store_email: formData.storeNumber ? `ihop${formData.storeNumber}@opportunityrestaurantgroup.com` : null,
            intake_channel: formData.intakeChannel, source: 'Staff Intake', issue: formData.issue,
            issue_category: formData.issueCategory, issue_subcategory: formData.issueSubcategory,
            notes: formData.initialNotes,
          },
        });
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create the case.'); }
    finally { setIsSubmitting(false); }
  };

  if (success) return <Shell><div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"><CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-5" /><h2 className="text-2xl font-semibold text-green-900">Case created</h2><p className="mt-3 text-green-800">The case is now in Guest Cases and the team alert will include its link.</p><button className="mt-7 px-5 py-2.5 rounded-lg bg-stone-900 text-white" onClick={() => { setFormData(emptyForm); setSuccess(false); setAuthorized(false); }}>Create another case</button></div></Shell>;

  if (!authorized) return <Shell><div className="max-w-md mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8"><LockKeyhole className="w-10 h-10 text-stone-700 mb-5" /><h2 className="text-2xl font-semibold text-stone-900">Staff access</h2><p className="mt-2 text-stone-600">Enter the staff access code to open the case intake form.</p><form onSubmit={authorize} className="mt-6 space-y-4"><Field label="Access code" required><input autoFocus type="password" value={formData.staffAccessCode} onChange={e => update('staffAccessCode', e.target.value)} className={inputClass} required /></Field>{error && <p className="text-sm text-red-700">{error}</p>}<button className="w-full px-5 py-2.5 rounded-lg bg-stone-900 text-white">Continue</button></form></div></Shell>;

  return <Shell><div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 md:p-8"><div className="flex items-start justify-between gap-4 mb-7"><div><p className="text-sm font-semibold text-stone-500 uppercase tracking-wide">Guest Relations</p><h2 className="text-3xl font-semibold text-stone-900 mt-1">Staff case intake</h2><p className="mt-2 text-stone-600">Log a guest contact from a phone call or email.</p></div><button title="Back to guest form" onClick={() => window.location.href = '/'} className="p-2 rounded-lg border border-stone-200 text-stone-600"><ArrowLeft className="w-5 h-5" /></button></div><form onSubmit={submit} className="space-y-6">
    <div className="grid md:grid-cols-2 gap-5"><Field label="How did the guest contact us?" required><select className={inputClass} value={formData.intakeChannel} onChange={e => update('intakeChannel', e.target.value)}><option>Staff Intake - Phone</option><option>Staff Intake - Email</option></select></Field><Field label="Contact type" required><select className={inputClass} value={formData.contactType} onChange={e => update('contactType', e.target.value)}><option value="opportunity">Opportunity</option><option value="celebration">Celebration</option></select></Field></div>
    <div className="grid md:grid-cols-2 gap-5"><Field label="Guest name" required><input className={inputClass} value={formData.name} onChange={e => update('name', e.target.value)} required /></Field><Field label="Preferred contact method" required><select className={inputClass} value={formData.contactMethod} onChange={e => update('contactMethod', e.target.value)}><option value="email">Email</option><option value="phone">Phone</option><option value="text">Text</option></select></Field></div>
    <div className="grid md:grid-cols-2 gap-5"><Field label="Guest email"><input type="email" className={inputClass} value={formData.email} onChange={e => update('email', e.target.value)} /></Field><Field label="Guest phone"><input type="tel" className={inputClass} value={formData.phone} onChange={e => update('phone', e.target.value)} /></Field></div>
    <Field label="When did the incident occur?" required><input type="datetime-local" className={inputClass} value={formData.date} onChange={e => update('date', e.target.value)} required /></Field>
    <div className="grid md:grid-cols-3 gap-5"><Field label="State" required><select className={inputClass} value={formData.state} onChange={e => update('state', e.target.value)} required><option value="">Select state</option>{STATE_OPTIONS.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}</select></Field><Field label="City" required><select className={inputClass} value={formData.city} onChange={e => update('city', e.target.value)} disabled={!formData.state} required><option value="">Select city</option>{availableCities.map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Store" required><select className={inputClass} value={formData.storeNumber} onChange={e => update('storeNumber', e.target.value)} disabled={!formData.city} required><option value="">Select store</option>{availableLocations.map(l => <option key={l.storeNumber} value={l.storeNumber}>#{l.storeNumber} · {l.address}</option>)}</select></Field></div>
    {selectedLocation && <p className="-mt-3 text-xs text-stone-500">{selectedLocation.address}, {selectedLocation.city}, {selectedLocation.state} · ihop{selectedLocation.storeNumber}@opportunityrestaurantgroup.com</p>}
    <div className="grid md:grid-cols-2 gap-5"><Field label="Issue category" required><select className={inputClass} value={formData.issueCategory} onChange={e => update('issueCategory', e.target.value)}>{Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Issue subcategory" required><select className={inputClass} value={formData.issueSubcategory} onChange={e => update('issueSubcategory', e.target.value)}>{subcategories.map(s => <option key={s}>{s}</option>)}</select></Field></div>
    <Field label="What happened?" required><textarea className={`${inputClass} resize-y`} rows={5} value={formData.issue} onChange={e => update('issue', e.target.value)} required /></Field><Field label="Initial internal notes"><textarea className={`${inputClass} resize-y`} rows={3} value={formData.initialNotes} onChange={e => update('initialNotes', e.target.value)} placeholder="Anything the case manager should know immediately" /></Field>
    {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}<button disabled={isSubmitting} className="px-6 py-3 rounded-lg bg-stone-900 text-white flex items-center gap-2 disabled:opacity-60">{isSubmitting ? 'Creating case...' : 'Create case'}<Send className="w-4 h-4" /></button>
  </form></div></Shell>;
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-stone-50 font-sans"><header className="bg-white border-b border-stone-200"><div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-2"><div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold">VG</div><span className="text-xl font-semibold text-stone-900">Voice of the Guest</span></div></header><main className="max-w-3xl mx-auto px-6 py-10 md:py-14">{children}</main></div>; }
