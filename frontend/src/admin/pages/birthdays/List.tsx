import React, { useEffect, useRef, useState } from 'react';
import { CakeIcon, CalendarClockIcon, Loader2Icon, MailCheckIcon, RefreshCwIcon, SaveIcon, SendIcon } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { DataTable, Column } from '../../components/DataTable';
import { TextField, TextAreaField, NumberField, CheckboxField, ImageUploader } from '../../components/fields/Fields';
import { useAdminList } from '../../hooks/useAdminList';
import { useToast } from '../../components/ToastProvider';
import { apiGetOne, apiGetList, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';

interface CustomerRef {
  _id: string;
  user?: { fullName?: string; email?: string };
  dateOfBirth?: string;
}

interface BirthdayLogEntry {
  _id: string;
  customer?: CustomerRef;
  status: 'sent' | 'failed';
  method: 'auto' | 'manual';
  emailTo: string;
  couponCode?: string;
  errorMessage?: string;
  resendCount: number;
  sentAt: string;
}

interface TodayEntry {
  customer: CustomerRef;
  log: BirthdayLogEntry | null;
}

interface UpcomingEntry {
  customer: CustomerRef;
  daysUntil: number;
}

interface BirthdayConfig {
  subjectTemplate: string;
  messageTemplate: string;
  backgroundImageUrl: string;
  couponEnabled: boolean;
  couponDiscountPercent: number;
  couponValidDays: number;
}

type Tab = 'today' | 'upcoming' | 'settings' | 'log';

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function AdminBirthdaysList() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('today');
  const [today, setToday] = useState<TodayEntry[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEntry[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [running, setRunning] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const loadLists = () => {
    setLoadingLists(true);
    Promise.all([
      apiGetList<TodayEntry>('/birthdays/today', {}),
      apiGetList<UpcomingEntry>('/birthdays/upcoming', { days: 30 }),
    ]).
    then(([t, u]) => {
      setToday(t.data);
      setUpcoming(u.data);
    }).
    finally(() => setLoadingLists(false));
  };

  useEffect(() => { loadLists(); }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const result = await apiPost<{ checked: number; sent: number }>('/birthdays/run-now');
      toast(`Checked ${result.checked} birthday(s), sent ${result.sent}.`);
      loadLists();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to run the birthday job.', 'error');
    } finally {
      setRunning(false);
    }
  };

  const resend = async (customerId: string) => {
    setResendingId(customerId);
    try {
      await apiPost(`/birthdays/resend/${customerId}`);
      toast('Birthday wish sent.');
      loadLists();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to send birthday wish.', 'error');
    } finally {
      setResendingId(null);
    }
  };

  const sentTodayCount = today.filter((t) => t.log?.status === 'sent').length;

  return (
    <div>
      <PageHeader
        title="Birthday Wishes"
        subtitle="Automatic birthday emails, cards and offers for your customers"
        action={
        <button onClick={runNow} disabled={running} className="flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {running ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <RefreshCwIcon className="h-4 w-4" />}
            Run Now
          </button>
        } />


      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={CakeIcon} label="Birthdays Today" value={today.length} accent="gold" index={0} />
        <StatCard icon={CalendarClockIcon} label="Upcoming (30 days)" value={upcoming.length} accent="emerald" index={1} />
        <StatCard icon={MailCheckIcon} label="Sent Today" value={sentTodayCount} accent="forest" index={2} />
      </div>

      <div className="mb-6 inline-flex flex-wrap rounded-full bg-white p-1 shadow-soft">
        {([
          ['today', 'Today'],
          ['upcoming', 'Upcoming'],
          ['settings', 'Message & Coupon'],
          ['log', 'Delivery Log'],
        ] as [Tab, string][]).map(([key, label]) =>
        <button key={key} onClick={() => setTab(key)} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${tab === key ? 'bg-forest text-white' : 'text-forest/60 hover:text-forest'}`}>
            {label}
          </button>
        )}
      </div>

      {tab === 'today' &&
      <TodayPanel entries={today} loading={loadingLists} resendingId={resendingId} onResend={resend} />
      }
      {tab === 'upcoming' &&
      <UpcomingPanel entries={upcoming} loading={loadingLists} />
      }
      {tab === 'settings' &&
      <SettingsPanel />
      }
      {tab === 'log' &&
      <LogPanel onResend={resend} resendingId={resendingId} />
      }
    </div>);

}

function TodayPanel({ entries, loading, resendingId, onResend }: {entries: TodayEntry[];loading: boolean;resendingId: string | null;onResend: (id: string) => void;}) {
  if (loading) return <div className="grid h-40 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  if (entries.length === 0) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-forest/50 shadow-soft">No birthdays today.</div>;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="divide-y divide-forest/5">
        {entries.map(({ customer, log }) =>
        <div key={customer._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-forest">{customer.user?.fullName || 'Customer'}</p>
              <p className="text-xs text-forest/50">{customer.user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              {log ?
            <StatusBadge status={log.status} /> :

            <span className="inline-flex items-center rounded-full bg-forest/8 px-2.5 py-1 text-xs font-semibold text-forest/50">Not sent yet</span>
            }
              <button
              onClick={() => onResend(customer._id)}
              disabled={resendingId === customer._id}
              className="flex items-center gap-1.5 rounded-full border border-forest/15 px-4 py-2 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">

                {resendingId === customer._id ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <SendIcon className="h-3.5 w-3.5" />}
                {log ? 'Resend' : 'Send Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}

function UpcomingPanel({ entries, loading }: {entries: UpcomingEntry[];loading: boolean;}) {
  if (loading) return <div className="grid h-40 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;
  if (entries.length === 0) return <div className="rounded-2xl bg-white p-10 text-center text-sm text-forest/50 shadow-soft">No birthdays in the next 30 days.</div>;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="divide-y divide-forest/5">
        {entries.map(({ customer, daysUntil }) =>
        <div key={customer._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-forest">{customer.user?.fullName || 'Customer'}</p>
              <p className="text-xs text-forest/50">{customer.user?.email} · {fmtDate(customer.dateOfBirth)}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald">
              {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
            </span>
          </div>
        )}
      </div>
    </div>);

}

function SettingsPanel() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<BirthdayConfig | null>(null);
  const [background, setBackground] = useState<string[]>([]);

  useEffect(() => {
    apiGetOne<BirthdayConfig>('/birthdays/config').
    then((c) => {
      setConfig(c);
      setBackground(c.backgroundImageUrl ? [c.backgroundImageUrl] : []);
    }).
    finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof BirthdayConfig,>(key: K, value: BirthdayConfig[K]) => {
    setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const save = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await apiPatch('/birthdays/config', { ...config, backgroundImageUrl: background[0] || '' });
      toast('Birthday settings saved.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) return <div className="grid h-40 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <p className="font-display text-sm font-semibold text-forest">Birthday Card & Message</p>
        <p className="mt-1 text-xs text-forest/45">Use <code className="rounded bg-cream px-1 py-0.5">{'{{firstName}}'}</code> anywhere you want the customer's first name inserted.</p>
        <div className="mt-4 space-y-4">
          <TextField label="Email Subject" value={config.subjectTemplate} onChange={(v) => update('subjectTemplate', v)} />
          <TextAreaField label="Birthday Message" value={config.messageTemplate} onChange={(v) => update('messageTemplate', v)} rows={5} />
          <ImageUploader label="Card Background Photo" value={background} onChange={setBackground} multiple={false} />
          <p className="text-xs text-forest/40">Leave empty to use the default Roxaval Travels scenery background.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <p className="font-display text-sm font-semibold text-forest">Birthday Coupon</p>
        <p className="mt-1 text-xs text-forest/45">Optionally include a discount code in the birthday email. A unique code is generated per customer.</p>
        <div className="mt-4 space-y-4">
          <CheckboxField label="Include a birthday discount coupon" checked={config.couponEnabled} onChange={(v) => update('couponEnabled', v)} />
          {config.couponEnabled &&
          <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Discount %" value={config.couponDiscountPercent} min={1} onChange={(v) => update('couponDiscountPercent', v)} />
              <NumberField label="Valid For (days)" value={config.couponValidDays} min={1} onChange={(v) => update('couponValidDays', v)} />
            </div>
          }
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
          {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
          Save Settings
        </button>
      </div>
    </div>);

}

function LogPanel({ onResend, resendingId }: {onResend: (id: string) => void;resendingId: string | null;}) {
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<BirthdayLogEntry>('/birthdays/logs', {});

  const columns: Column<BirthdayLogEntry>[] = [
  { header: 'Customer', render: (r) => r.customer?.user?.fullName || '—' },
  { header: 'Email', render: (r) => r.emailTo },
  { header: 'Status', render: (r) => r.status === 'failed' ? <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">Failed</span> : <StatusBadge status={r.status} /> },
  { header: 'Method', render: (r) => <span className="capitalize">{r.method}</span> },
  { header: 'Coupon', render: (r) => r.couponCode || '—' },
  { header: 'Resends', render: (r) => r.resendCount },
  { header: 'Sent', render: (r) => new Date(r.sentAt).toLocaleString() },
  {
    header: 'Actions',
    render: (r) => r.customer ?
    <button
      onClick={() => onResend(r.customer!._id)}
      disabled={resendingId === r.customer!._id}
      className="flex items-center gap-1.5 rounded-full border border-forest/15 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-cream disabled:opacity-60">

          {resendingId === r.customer!._id ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <SendIcon className="h-3.5 w-3.5" />}
          Resend
        </button> :
    '—'
  }];


  const mounted = useRef(false);
  useEffect(() => {
    // Refresh the log whenever a resend elsewhere completes (resendingId flips
    // back to null) — skip the very first render, useAdminList already fetches then.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (resendingId === null) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendingId]);

  return <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(r) => r._id} emptyMessage="No birthday emails sent yet." />;
}
