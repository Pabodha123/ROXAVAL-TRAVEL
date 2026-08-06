import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2Icon, SaveIcon, SearchIcon } from 'lucide-react';
import { apiGetList, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField, RefMultiSelect } from '../../components/fields/Fields';

const LEAD_SOURCE_OPTIONS = ['Website', 'Phone', 'Email', 'Walk-in', 'Referral', 'Agent', 'Other'];
const HOTEL_CATEGORIES = ['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort'];
const TRAVEL_STYLES = ['Relaxed', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon', 'Backpacking'];
const TRANSPORT_OPTIONS = ['Private Car', 'Van', 'SUV', 'Minibus', 'No Preference'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

interface CustomerRow {
  _id: string;
  user?: { fullName?: string; email?: string };
}

export function AdminCustomRequestNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');

  const [destOptions, setDestOptions] = useState<{ value: string; label: string }[]>([]);
  const [activityOptions, setActivityOptions] = useState<{ value: string; label: string }[]>([]);
  const [operationOptions, setOperationOptions] = useState<{ value: string; label: string }[]>([]);
  const [salesOptions, setSalesOptions] = useState<{ value: string; label: string }[]>([]);

  const [leadSource, setLeadSource] = useState('Phone');
  const [operationPerson, setOperationPerson] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [company, setCompany] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [infantAges, setInfantAges] = useState<number[]>([]);

  const [preferredDestinations, setPreferredDestinations] = useState<string[]>([]);
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
  const [hotelCategory, setHotelCategory] = useState('Standard');
  const [travelStyle, setTravelStyle] = useState('Relaxed');
  const [transportPreference, setTransportPreference] = useState('No Preference');
  const [roomTypePreference, setRoomTypePreference] = useState('');
  const [guideRequired, setGuideRequired] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(1000);
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    Promise.all([
    apiGetList<CustomerRow>('/customers', { limit: 200 }),
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }),
    apiGetList<{ _id: string; name: string }>('/activities', { limit: 100 }),
    apiGetList<{ _id: string; user?: { fullName?: string } }>('/admins', { department: 'operations', limit: 100 }),
    apiGetList<{ _id: string; user?: { fullName?: string } }>('/admins', { department: 'sales', limit: 100 })]
    ).then(([c, d, a, ops, sales]) => {
      setCustomers(c.data);
      setDestOptions(d.data.map((x) => ({ value: x._id, label: x.name })));
      setActivityOptions(a.data.map((x) => ({ value: x._id, label: x.name })));
      setOperationOptions(ops.data.map((x) => ({ value: x._id, label: x.user?.fullName || 'Unnamed' })));
      setSalesOptions(sales.data.map((x) => ({ value: x._id, label: x.user?.fullName || 'Unnamed' })));
    });
  }, []);

  useEffect(() => {
    setChildAges((prev) => Array.from({ length: children }, (_, i) => prev[i] ?? 8));
  }, [children]);
  useEffect(() => {
    setInfantAges((prev) => Array.from({ length: infants }, (_, i) => prev[i] ?? 1));
  }, [infants]);

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const term = customerSearch.toLowerCase();
    return c.user?.fullName?.toLowerCase().includes(term) || c.user?.email?.toLowerCase().includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerMode === 'existing' && !customerId) {
      toast('Please select an existing customer.', 'error');
      return;
    }
    if (customerMode === 'new' && (!newCustomerName.trim() || !newCustomerEmail.trim())) {
      toast('Please provide the new customer\'s name and email.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...(customerMode === 'existing' ?
      { customerId } :
      { newCustomer: { fullName: newCustomerName, email: newCustomerEmail, phone: newCustomerPhone || undefined } }),
      leadSource,
      operationPerson: operationPerson || undefined,
      salesPerson: salesPerson || undefined,
      company,
      priority,
      travelDates: { startDate, endDate, isFlexible },
      travelers: { adults, children, infants, childAges, infantAges },
      preferredDestinations,
      preferredActivities,
      hotelCategory,
      travelStyle,
      transportPreference,
      roomTypePreference,
      guideRequired,
      estimatedBudget: { amount: budgetAmount, currency: budgetCurrency, perPerson: false },
      specialRequests
    };
    try {
      const result = await apiPost<{ _id: string }>('/custom-tours/admin/create', payload);
      toast('Query created.');
      navigate(`/admin/custom-requests/${result._id}`);
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to create query.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Query" subtitle="Create a custom tour query on behalf of a phone/email/walk-in lead" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Customer</p>
          <div className="mb-3 flex gap-2">
            <button type="button" onClick={() => setCustomerMode('existing')} className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${customerMode === 'existing' ? 'border-emerald bg-emerald/10 text-emerald' : 'border-forest/15 text-forest/60'}`}>Existing Customer</button>
            <button type="button" onClick={() => setCustomerMode('new')} className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${customerMode === 'new' ? 'border-emerald bg-emerald/10 text-emerald' : 'border-forest/15 text-forest/60'}`}>+ New Customer</button>
          </div>
          {customerMode === 'existing' ?
          <div>
              <div className="relative mb-2">
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
                <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search by name or email…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
              </div>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-xl border border-forest/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald">
                <option value="">Select customer…</option>
                {filteredCustomers.map((c) => <option key={c._id} value={c._id}>{c.user?.fullName} ({c.user?.email})</option>)}
              </select>
            </div> :

          <div className="grid gap-4 sm:grid-cols-3">
              <TextField label="Full Name" value={newCustomerName} onChange={setNewCustomerName} required />
              <TextField label="Email" value={newCustomerEmail} onChange={setNewCustomerEmail} type="email" required />
              <TextField label="Phone" value={newCustomerPhone} onChange={setNewCustomerPhone} />
            </div>
          }
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Lead Details</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField label="Lead Source" value={leadSource} onChange={setLeadSource} options={LEAD_SOURCE_OPTIONS.map((o) => ({ label: o, value: o }))} />
            <SelectField label="Operation Person" value={operationPerson} onChange={setOperationPerson} options={[{ label: 'Unassigned', value: '' }, ...operationOptions]} />
            <SelectField label="Sales Person" value={salesPerson} onChange={setSalesPerson} options={[{ label: 'Unassigned', value: '' }, ...salesOptions]} />
            <TextField label="Company" value={company} onChange={setCompany} placeholder="e.g. Agency name (optional)" />
            <SelectField label="Priority" value={priority} onChange={setPriority} options={PRIORITY_OPTIONS.map((p) => ({ label: p, value: p }))} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Travel Dates &amp; Travelers</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextField label="From Date" type="date" value={startDate} onChange={setStartDate} required />
            <TextField label="To Date" type="date" value={endDate} onChange={setEndDate} required />
            <NumberField label="Adults" value={adults} onChange={setAdults} min={1} required />
            <NumberField label="Children (5-11)" value={children} onChange={setChildren} min={0} />
            <NumberField label="Infants (under 5)" value={infants} onChange={setInfants} min={0} />
          </div>
          <div className="mt-3">
            <CheckboxField label="Dates are flexible" checked={isFlexible} onChange={setIsFlexible} />
          </div>
          {childAges.length > 0 &&
          <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-forest/60">Child Ages</p>
              <div className="flex flex-wrap gap-2">
                {childAges.map((age, i) =>
              <input key={i} type="number" min={5} max={11} value={age} onChange={(e) => setChildAges((prev) => prev.map((a, idx) => idx === i ? Number(e.target.value) || 0 : a))} className="w-20 rounded-lg border border-forest/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-emerald" />
              )}
              </div>
            </div>
          }
          {infantAges.length > 0 &&
          <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-forest/60">Infant Ages</p>
              <div className="flex flex-wrap gap-2">
                {infantAges.map((age, i) =>
              <input key={i} type="number" min={0} max={4} value={age} onChange={(e) => setInfantAges((prev) => prev.map((a, idx) => idx === i ? Number(e.target.value) || 0 : a))} className="w-20 rounded-lg border border-forest/15 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-emerald" />
              )}
              </div>
            </div>
          }
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Preferences</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <RefMultiSelect label="Preferred Destinations" options={destOptions} value={preferredDestinations} onChange={setPreferredDestinations} />
            <RefMultiSelect label="Preferred Activities" options={activityOptions} value={preferredActivities} onChange={setPreferredActivities} />
            <SelectField label="Hotel Category" value={hotelCategory} onChange={setHotelCategory} options={HOTEL_CATEGORIES.map((c) => ({ label: c, value: c }))} />
            <SelectField label="Travel Style" value={travelStyle} onChange={setTravelStyle} options={TRAVEL_STYLES.map((s) => ({ label: s, value: s }))} />
            <SelectField label="Vehicle Type" value={transportPreference} onChange={setTransportPreference} options={TRANSPORT_OPTIONS.map((t) => ({ label: t, value: t }))} />
            <TextField label="Room Type Preference" value={roomTypePreference} onChange={setRoomTypePreference} placeholder="e.g. Double" />
          </div>
          <div className="mt-4">
            <CheckboxField label="Guide required" checked={guideRequired} onChange={setGuideRequired} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Budget &amp; Notes</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField label="Estimated Budget" value={budgetAmount} onChange={setBudgetAmount} min={0} required />
            <TextField label="Currency" value={budgetCurrency} onChange={setBudgetCurrency} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Special Requests" value={specialRequests} onChange={setSpecialRequests} rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/custom-requests')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            Create Query
          </button>
        </div>
      </form>
    </div>);

}
