import React, { useEffect, useState } from 'react';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetOne, apiPatch, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, CheckboxField, ImageUploader } from '../../components/fields/Fields';

interface SettingsData {
  companyName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  socialLinks: { facebook: string; instagram: string; tiktok: string; youtube: string; whatsapp: string };
  bankDetails: { bankName: string; accountName: string; accountNumber: string; branch: string; swift: string };
  seoDefaults: { metaTitle: string; metaDescription: string };
  maintenanceMode: boolean;
}

export function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [logo, setLogo] = useState<string[]>([]);

  useEffect(() => {
    apiGetOne<SettingsData>('/settings').
    then((s) => {
      setSettings(s);
      setLogo(s.logoUrl ? [s.logoUrl] : []);
    }).
    finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof SettingsData,>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
  };

  const updateNested = <G extends 'socialLinks' | 'bankDetails' | 'seoDefaults',>(group: G, key: keyof SettingsData[G], value: string) => {
    setSettings((prev) => prev ? { ...prev, [group]: { ...prev[group], [key]: value } } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await apiPatch('/settings', { ...settings, logoUrl: logo[0] || '' });
      toast('Settings saved.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Company details, contact info, socials and payment settings" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Company Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Company Name" value={settings.companyName} onChange={(v) => update('companyName', v)} />
            <TextField label="Website" value={settings.website} onChange={(v) => update('website', v)} />
            <TextField label="Contact Email" value={settings.email} onChange={(v) => update('email', v)} type="email" />
            <TextField label="Contact Phone" value={settings.phone} onChange={(v) => update('phone', v)} />
            <div className="sm:col-span-2"><TextField label="Address" value={settings.address} onChange={(v) => update('address', v)} /></div>
          </div>
          <div className="mt-4">
            <ImageUploader label="Company Logo" value={logo} onChange={setLogo} multiple={false} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Social Media</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Facebook" value={settings.socialLinks.facebook} onChange={(v) => updateNested('socialLinks', 'facebook', v)} />
            <TextField label="Instagram" value={settings.socialLinks.instagram} onChange={(v) => updateNested('socialLinks', 'instagram', v)} />
            <TextField label="TikTok" value={settings.socialLinks.tiktok} onChange={(v) => updateNested('socialLinks', 'tiktok', v)} />
            <TextField label="YouTube" value={settings.socialLinks.youtube} onChange={(v) => updateNested('socialLinks', 'youtube', v)} />
            <TextField label="WhatsApp Number" value={settings.socialLinks.whatsapp} onChange={(v) => updateNested('socialLinks', 'whatsapp', v)} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Payment / Bank Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Bank Name" value={settings.bankDetails.bankName} onChange={(v) => updateNested('bankDetails', 'bankName', v)} />
            <TextField label="Account Name" value={settings.bankDetails.accountName} onChange={(v) => updateNested('bankDetails', 'accountName', v)} />
            <TextField label="Account Number" value={settings.bankDetails.accountNumber} onChange={(v) => updateNested('bankDetails', 'accountNumber', v)} />
            <TextField label="Branch" value={settings.bankDetails.branch} onChange={(v) => updateNested('bankDetails', 'branch', v)} />
            <TextField label="SWIFT Code" value={settings.bankDetails.swift} onChange={(v) => updateNested('bankDetails', 'swift', v)} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">SEO &amp; Website</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Default Meta Title" value={settings.seoDefaults.metaTitle} onChange={(v) => updateNested('seoDefaults', 'metaTitle', v)} />
            <TextField label="Default Meta Description" value={settings.seoDefaults.metaDescription} onChange={(v) => updateNested('seoDefaults', 'metaDescription', v)} />
          </div>
          <div className="mt-4">
            <CheckboxField label="Maintenance Mode" checked={settings.maintenanceMode} onChange={(v) => update('maintenanceMode', v)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>);

}
