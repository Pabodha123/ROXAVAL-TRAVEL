import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField, NumberField, SelectField, TagListInput, ImageUploader } from '../../components/fields/Fields';

interface TourGuideDetail {
  name: string;
  photo: string;
  languages: string[];
  specialties: string[];
  yearsExperience: number;
  bio: string;
  contactPhone: string;
  contactEmail: string;
  pricePerDay: number;
  status: string;
}

export function AdminTourGuideForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState(0);
  const [bio, setBio] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [pricePerDay, setPricePerDay] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<TourGuideDetail>(`/tour-guides/${id}`).
    then((g) => {
      setName(g.name);
      setPhoto(g.photo ? [g.photo] : []);
      setLanguages(g.languages || []);
      setSpecialties(g.specialties || []);
      setYearsExperience(g.yearsExperience || 0);
      setBio(g.bio || '');
      setContactPhone(g.contactPhone || '');
      setContactEmail(g.contactEmail || '');
      setPricePerDay(g.pricePerDay);
      setStatus(g.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, photo: photo[0] || '', languages, specialties, yearsExperience, bio, contactPhone, contactEmail, pricePerDay, status };
    try {
      if (isEdit) {
        await apiPatch(`/tour-guides/${id}`, payload);
        toast('Guide updated.');
      } else {
        await apiPost('/tour-guides', payload);
        toast('Guide created.');
      }
      navigate('/admin/tour-guides');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save guide.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Tour Guide' : 'Add Tour Guide'} subtitle="Licensed guide details for custom itinerary assignment" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full Name" value={name} onChange={setName} required />
            <NumberField label="Years of Experience" value={yearsExperience} onChange={setYearsExperience} min={0} />
            <NumberField label="Price / Day (USD)" value={pricePerDay} onChange={setPricePerDay} min={0} required />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
            <TextField label="Phone" value={contactPhone} onChange={setContactPhone} />
            <TextField label="Email" value={contactEmail} onChange={setContactEmail} type="email" />
          </div>
          <div className="mt-4">
            <TextAreaField label="Bio" value={bio} onChange={setBio} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Photo &amp; Expertise</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Photo" value={photo} onChange={setPhoto} multiple={false} />
            <div className="space-y-4">
              <TagListInput label="Languages" value={languages} onChange={setLanguages} placeholder="e.g. English" />
              <TagListInput label="Specialties" value={specialties} onChange={setSpecialties} placeholder="e.g. Wildlife Safaris" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/tour-guides')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Guide'}
          </button>
        </div>
      </form>
    </div>);

}
