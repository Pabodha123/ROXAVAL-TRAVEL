import React, { useEffect, useState } from 'react';
import { Loader2Icon, LockIcon, SaveIcon, UserIcon } from 'lucide-react';
import { apiGetOne, apiPatch, ApiRequestError } from '../../../lib/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField } from '../../components/fields/Fields';

interface AdminProfileData {
  department?: string;
  isSuperAdmin: boolean;
  user: { fullName: string; email: string; phone?: string };
}

export function AdminProfile() {
  const { refreshMe } = useAdminAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState<AdminProfileData | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    apiGetOne<AdminProfileData>('/admins/me').
    then((p) => {
      setProfile(p);
      setFullName(p.user.fullName);
      setPhone(p.user.phone || '');
    }).
    finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiPatch('/admins/me', { fullName, phone });
      await refreshMe();
      toast('Profile updated.');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('New passwords do not match.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await apiPatch('/auth/update-password', { currentPassword, newPassword });
      toast('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || !profile) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your account details and security" />

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-forest"><UserIcon className="h-4 w-4" /> Profile Details</p>
          <div className="space-y-4">
            <TextField label="Full Name" value={fullName} onChange={setFullName} required />
            <TextField label="Email" value={profile.user.email} onChange={() => {}} />
            <TextField label="Phone" value={phone} onChange={setPhone} />
            <TextField label="Role" value={profile.isSuperAdmin ? 'Super Admin' : 'Admin'} onChange={() => {}} />
          </div>
          <button type="submit" disabled={savingProfile} className="mt-5 flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {savingProfile ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            Save Profile
          </button>
        </form>

        <form onSubmit={savePassword} className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-forest"><LockIcon className="h-4 w-4" /> Change Password</p>
          <div className="space-y-4">
            <TextField label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} required />
            <TextField label="New Password" type="password" value={newPassword} onChange={setNewPassword} required />
            <TextField label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} required />
          </div>
          <button type="submit" disabled={savingPassword} className="mt-5 flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {savingPassword ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            Change Password
          </button>
        </form>
      </div>
    </div>);

}
