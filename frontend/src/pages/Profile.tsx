import React, { useEffect, useState } from 'react';
import { Loader2Icon, SaveIcon, CheckIcon } from 'lucide-react';
import { PageBanner } from '../components/layout/PageBanner';
import { apiGetOne, apiPatch, ApiRequestError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface CustomerProfile {
  fullName: string;
  phone: string;
  country: string;
  address: string;
  dateOfBirth: string;
  passportNumber: string;
  marketingOptIn: boolean;
}

const inputClass = 'w-full rounded-xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/35 focus:border-emerald';
const labelClass = 'mb-1.5 block text-sm font-medium text-forest';

export function Profile() {
  const { refreshMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);

  useEffect(() => {
    apiGetOne<{ user?: { fullName?: string; phone?: string }; country?: string; address?: string; dateOfBirth?: string; passportNumber?: string; marketingOptIn?: boolean }>('/customers/me').
    then((c) => {
      setProfile({
        fullName: c.user?.fullName || '',
        phone: c.user?.phone || '',
        country: c.country || '',
        address: c.address || '',
        dateOfBirth: c.dateOfBirth ? c.dateOfBirth.slice(0, 10) : '',
        passportNumber: c.passportNumber || '',
        marketingOptIn: c.marketingOptIn || false,
      });
    }).
    finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof CustomerProfile,>(key: K, value: CustomerProfile[K]) => {
    setProfile((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      await apiPatch('/customers/me', profile);
      await refreshMe();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-16">
      <PageBanner
        eyebrow="My Account"
        title="Your Profile"
        subtitle="Keep your details up to date - including your birthday, so we can send you something special every year."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Profile' }]} />

      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {loading || !profile ?
        <div className="grid h-40 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div> :

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-white p-6 shadow-soft sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input required value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={profile.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={profile.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Passport Number</label>
                <input value={profile.passportNumber} onChange={(e) => update('passportNumber', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input value={profile.country} onChange={(e) => update('country', e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address</label>
                <input value={profile.address} onChange={(e) => update('address', e.target.value)} className={inputClass} />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-forest">
              <input type="checkbox" checked={profile.marketingOptIn} onChange={(e) => update('marketingOptIn', e.target.checked)} className="h-4 w-4 rounded border-forest/30 text-emerald focus:ring-emerald" />
              Send me travel deals and inspiration by email
            </label>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <div className="flex items-center gap-4 border-t border-forest/10 pt-5">
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-emerald px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70">
                {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                Save Changes
              </button>
              {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald"><CheckIcon className="h-4 w-4" /> Saved</span>}
            </div>
          </form>
        }
      </section>
    </main>);

}
