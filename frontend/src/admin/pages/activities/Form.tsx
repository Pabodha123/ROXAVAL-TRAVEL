import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetList, apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField, NumberField, SelectField, CheckboxField, TagListInput, RefMultiSelect, ImageUploader } from '../../components/fields/Fields';
import type { Activity } from '../../../types/activity';

const CATEGORY_OPTIONS = ['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature'];
const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Hard'];

export function AdminActivityForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [destOptions, setDestOptions] = useState<{ value: string; label: string }[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [category, setCategory] = useState('Adventure');
  const [durationHours, setDurationHours] = useState(2);
  const [priceFrom, setPriceFrom] = useState(0);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [difficultyLevel, setDifficultyLevel] = useState('Easy');
  const [location, setLocation] = useState('');
  const [bestSeason, setBestSeason] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [thingsIncluded, setThingsIncluded] = useState<string[]>([]);
  const [thingsToBring, setThingsToBring] = useState<string[]>([]);
  const [lat, setLat] = useState<number | ''>('');
  const [lng, setLng] = useState<number | ''>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    apiGetList<{ _id: string; name: string }>('/destinations', { limit: 100 }).then(({ data }) => {
      setDestOptions(data.map((d) => ({ value: d._id, label: d.name })));
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<Activity>(`/activities/${id}`).
    then((a) => {
      setName(a.name);
      setDescription(a.description);
      setImage(a.image ? [a.image] : []);
      setGallery(a.gallery || []);
      setCategory(a.category);
      setDurationHours(a.durationHours);
      setPriceFrom(a.priceFrom);
      setDestinations(a.destinations.map((d) => d._id));
      setDifficultyLevel(a.difficultyLevel);
      setLocation(a.location || '');
      setBestSeason(a.bestSeason || '');
      setHighlights(a.highlights || []);
      setThingsIncluded(a.thingsIncluded || []);
      setThingsToBring(a.thingsToBring || []);
      setLat(a.mapLocation?.lat ?? '');
      setLng(a.mapLocation?.lng ?? '');
      setIsFeatured(a.isFeatured);
      setStatus(a.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      description,
      image: image[0] || '',
      gallery,
      category,
      durationHours,
      priceFrom,
      destinations,
      difficultyLevel,
      location,
      bestSeason,
      highlights,
      thingsIncluded,
      thingsToBring,
      mapLocation: lat !== '' && lng !== '' ? { lat, lng } : undefined,
      isFeatured,
      status
    };
    try {
      if (isEdit) {
        await apiPatch(`/activities/${id}`, payload);
        toast('Activity updated.');
      } else {
        await apiPost('/activities', payload);
        toast('Activity created.');
      }
      navigate('/admin/activities');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save activity.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Activity' : 'Add Activity'} subtitle="A bookable experience travelers can add to their trip" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Basics</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={name} onChange={setName} required />
            <TextField label="Location" value={location} onChange={setLocation} />
            <SelectField label="Category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS.map((c) => ({ label: c, value: c }))} />
            <SelectField label="Difficulty" value={difficultyLevel} onChange={setDifficultyLevel} options={DIFFICULTY_OPTIONS.map((c) => ({ label: c, value: c }))} />
            <NumberField label="Duration (Hours)" value={durationHours} onChange={setDurationHours} min={0.5} step={0.5} />
            <NumberField label="Price From (USD)" value={priceFrom} onChange={setPriceFrom} min={0} />
            <TextField label="Best Season" value={bestSeason} onChange={setBestSeason} placeholder="e.g. Dec – Mar" />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }]} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Description" value={description} onChange={setDescription} required />
          </div>
          <div className="mt-4">
            <CheckboxField label="Feature on homepage" checked={isFeatured} onChange={setIsFeatured} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Media</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Cover Image" value={image} onChange={setImage} multiple={false} />
            <ImageUploader label="Gallery" value={gallery} onChange={setGallery} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <RefMultiSelect label="Related Destinations" options={destOptions} value={destinations} onChange={setDestinations} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Map Latitude" value={lat} onChange={setLat} step={0.0001} />
              <NumberField label="Map Longitude" value={lng} onChange={setLng} step={0.0001} />
            </div>
            <TagListInput label="Highlights" value={highlights} onChange={setHighlights} />
            <TagListInput label="Things Included" value={thingsIncluded} onChange={setThingsIncluded} />
            <TagListInput label="Things to Bring" value={thingsToBring} onChange={setThingsToBring} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/activities')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Activity'}
          </button>
        </div>
      </form>
    </div>);

}
