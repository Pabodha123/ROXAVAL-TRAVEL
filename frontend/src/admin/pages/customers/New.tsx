import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField } from '../../components/fields/Fields';

export function AdminCustomerNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast('Please provide both first and last name.', 'error');
      return;
    }
    setSaving(true);
    try {
      const customer = await apiPost<{ _id: string }>('/customers', {
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        passportNumber: passportNumber.trim() || undefined,
        country: nationality.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast('Customer created.');
      navigate(`/admin/customers/${customer._id}`);
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to create customer.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Add Customer" subtitle="Manually create a customer record for a phone, walk-in, or referred lead" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First Name" value={firstName} onChange={setFirstName} required />
            <TextField label="Last Name" value={lastName} onChange={setLastName} required />
            <TextField label="Email" value={email} onChange={setEmail} type="email" required />
            <TextField label="Phone" value={phone} onChange={setPhone} />
            <TextField label="Date of Birth" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
            <TextField label="Passport Number" value={passportNumber} onChange={setPassportNumber} />
            <TextField label="Nationality" value={nationality} onChange={setNationality} />
            <TextField label="Address" value={address} onChange={setAddress} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Notes (visible to admins only)" value={notes} onChange={setNotes} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/customers')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            Create Customer
          </button>
        </div>
      </form>
    </div>);

}
