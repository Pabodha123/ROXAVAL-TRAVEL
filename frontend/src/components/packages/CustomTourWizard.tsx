import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon, MapPinIcon, TargetIcon, SendIcon, LockIcon, Loader2Icon, SparklesIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApiList } from '../../hooks/useApiList';
import { apiGetOne, apiPost, ApiRequestError } from '../../lib/api';
import { AutocompleteTagInput } from '../ui/AutocompleteTagInput';
import type { DestinationRef } from '../../types/activity';
import type { Activity } from '../../types/activity';
import type { HotelRef } from '../../types/tourPackage';
import type { TourPackage } from '../../types/tourPackage';

const steps = [
'Travel Info',
'Destinations',
'Activities',
'Accommodation',
'Budget & Style',
'Special Requests',
'Review & Submit'];

const HOTEL_CATEGORIES = ['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort'];
const MEAL_PREFERENCES = ['Breakfast Only', 'Half Board', 'Full Board', 'All Inclusive', 'Vegetarian', 'Vegan', 'Halal', 'No Preference'];
const TRAVEL_STYLES = ['Relaxed', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon', 'Backpacking'];
const TRANSPORT_OPTIONS = ['Private Car', 'Van', 'SUV', 'Minibus', 'No Preference'];

interface FormData {
  arrivalDate: string;
  days: string;
  adults: number;
  children: number;
  infants: number;
  isFlexible: boolean;
  selectedDestinations: string[];
  selectedActivities: string[];
  customDestinations: string[];
  customActivities: string[];
  hotelCategory: string;
  mealPreferences: string[];
  transportPreference: string;
  budget: string;
  perPerson: boolean;
  travelStyle: string;
  specialRequests: string;
}

const initialFormData: FormData = {
  arrivalDate: '', days: '7', adults: 2, children: 0, infants: 0, isFlexible: false,
  selectedDestinations: [], selectedActivities: [],
  customDestinations: [], customActivities: [],
  hotelCategory: 'Standard', mealPreferences: [], transportPreference: 'No Preference',
  budget: '', perPerson: true, travelStyle: 'Relaxed',
  specialRequests: ''
};

interface AiItineraryDay {
  dayNumber: number;
  title: string;
  schedule: string;
  destinations: string[];
  activities: string[];
  hotel?: string;
  meals: string[];
}

interface AiItineraryDraft {
  summary: string;
  days: AiItineraryDay[];
  estimatedTotal?: number;
  currency: string;
  generatedAt: string;
}

export function CustomTourWizard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillPackage, setPrefillPackage] = useState<TourPackage | null>(null);
  const [prefillDestinationName, setPrefillDestinationName] = useState<string | null>(null);

  const [aiDraft, setAiDraft] = useState<AiItineraryDraft | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const { items: destinations, loading: destinationsLoading } = useApiList<DestinationRef>('/destinations', { limit: 100 }, 100);
  const { items: activities, loading: activitiesLoading } = useApiList<Activity>('/activities', { limit: 100 }, 100);
  const { items: hotels } = useApiList<HotelRef>('/hotels', { limit: 100 }, 100);

  // Prefill from "Plan My Tour" on a Tour Package Details page, if navigated here with a package selected
  useEffect(() => {
    const packageId = (location.state as { packageId?: string } | null)?.packageId;
    if (!packageId) return;
    apiGetOne<TourPackage>(`/packages/${packageId}`).
    then((pkg) => {
      setPrefillPackage(pkg);
      setFormData((prev) => ({
        ...prev,
        days: String(pkg.durationDays || prev.days),
        selectedDestinations: pkg.destinations.map((d) => d._id),
        selectedActivities: pkg.activities.map((a) => a._id),
        budget: String(pkg.discountPrice ?? pkg.price ?? prev.budget),
        travelStyle: TRAVEL_STYLES.includes(pkg.category) ? pkg.category : prev.travelStyle
      }));
    }).
    catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Prefill from "Plan My Tour" / "Book This Destination" on a Destination Details page
  useEffect(() => {
    const destinationId = (location.state as { destinationId?: string } | null)?.destinationId;
    if (!destinationId) return;
    apiGetOne<{ _id: string; name: string }>(`/destinations/${destinationId}`).
    then((dest) => {
      setPrefillDestinationName(dest.name);
      setFormData((prev) => ({
        ...prev,
        selectedDestinations: prev.selectedDestinations.includes(dest._id) ? prev.selectedDestinations : [...prev.selectedDestinations, dest._id]
      }));
    }).
    catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const destinationName = (id: string) => destinations.find((d) => d._id === id)?.name || id;
  const activityName = (id: string) => activities.find((a) => a._id === id)?.name || id;
  const hotelName = (id?: string) => hotels.find((h) => h._id === id)?.name;

  const buildPreferencesPayload = () => {
    const startDate = new Date(formData.arrivalDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(formData.days || 1));
    return {
      travelDates: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isFlexible: formData.isFlexible
      },
      travelers: { adults: formData.adults, children: formData.children, infants: formData.infants },
      preferredDestinations: formData.selectedDestinations,
      preferredActivities: formData.selectedActivities,
      customDestinations: formData.customDestinations,
      customActivities: formData.customActivities,
      hotelCategory: formData.hotelCategory,
      mealPreferences: formData.mealPreferences.length ? formData.mealPreferences : ['No Preference'],
      travelStyle: formData.travelStyle,
      transportPreference: formData.transportPreference,
      estimatedBudget: { amount: Number(formData.budget), currency: 'USD', perPerson: formData.perPerson },
      specialRequests: formData.specialRequests
    };
  };

  const generateDraft = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const draft = await apiPost<AiItineraryDraft>('/custom-tours/generate-itinerary', buildPreferencesPayload());
      setAiDraft(draft);
    } catch (err) {
      setAiError(err instanceof ApiRequestError ? err.message : 'Could not generate an AI itinerary. You can still submit without one.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (step === 6 && !aiDraft && !aiLoading && formData.arrivalDate && formData.days && formData.budget) {
      generateDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const toggleSelection = (field: 'selectedDestinations' | 'selectedActivities', id: string) => {
    setFormData((prev) => {
      const current = prev[field];
      return { ...prev, [field]: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] };
    });
  };

  const toggleMeal = (opt: string) => {
    setFormData((prev) => ({
      ...prev,
      mealPreferences: prev.mealPreferences.includes(opt) ?
      prev.mealPreferences.filter((x) => x !== opt) :
      [...prev.mealPreferences, opt]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.arrivalDate || !formData.days || !formData.budget) {
      setError('Please fill in travel dates, duration and estimated budget before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiPost('/custom-tours', {
        ...buildPreferencesPayload(),
        aiGeneratedItinerary: aiDraft || undefined
      });
      setSubmitted(true);
      toast('Your custom tour request has been submitted!');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-12 text-center shadow-lift">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald/10 text-emerald">
          <LockIcon className="h-8 w-8" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-semibold text-forest">Sign In to Design Your Trip</h3>
        <p className="mt-3 text-forest/70">Please sign in so our travel experts can reach you with a personalized itinerary.</p>
        <Link to="/auth" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 font-semibold text-forest transition-transform hover:scale-105">
          Sign In / Register
        </Link>
      </div>);

  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl bg-white p-12 text-center shadow-lift max-w-2xl mx-auto">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald/10 text-emerald">
          <CheckIcon className="h-10 w-10" />
        </div>
        <h3 className="mt-6 font-display text-3xl font-semibold text-forest">Inquiry Submitted Successfully!</h3>
        <p className="mt-4 text-forest/70">Our travel experts are reviewing your preferences and will craft a personalized itinerary for you shortly. You'll be notified as soon as it's ready.</p>
        <button onClick={() => navigate('/my-tours')} className="mt-8 rounded-full bg-forest px-8 py-3.5 font-semibold text-white hover:bg-emerald transition-colors">
          View in My Tours
        </button>
      </motion.div>);

  }

  return (
    <div className="rounded-3xl bg-white shadow-lift overflow-hidden max-w-5xl mx-auto">
      {/* Progress Header */}
      <div className="bg-forest px-8 py-6 text-white">
        <h2 className="font-display text-2xl font-semibold">Design Your Dream Tour</h2>
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {steps.map((s, i) =>
          <React.Fragment key={s}>
              <div className={`flex shrink-0 items-center gap-2 text-sm font-medium ${i === step ? 'text-gold' : i < step ? 'text-white' : 'text-white/40'}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i === step ? 'bg-gold text-forest' : i < step ? 'bg-white text-forest' : 'border border-white/40'}`}>
                  {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {s}
              </div>
              {i < steps.length - 1 && <div className={`h-px w-8 shrink-0 ${i < step ? 'bg-white' : 'bg-white/20'}`} />}
            </React.Fragment>
          )}
        </div>
      </div>

      {prefillPackage &&
      <div className="flex items-center justify-between gap-3 bg-emerald/10 px-8 py-3 text-sm text-emerald">
          <span className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 shrink-0" />
            Pre-filled from <strong className="font-semibold">{prefillPackage.name}</strong> — feel free to adjust anything below.
          </span>
          <button type="button" onClick={() => setPrefillPackage(null)} aria-label="Dismiss" className="shrink-0 text-emerald/60 hover:text-emerald">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      }

      {!prefillPackage && prefillDestinationName &&
      <div className="flex items-center justify-between gap-3 bg-emerald/10 px-8 py-3 text-sm text-emerald">
          <span className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 shrink-0" />
            <strong className="font-semibold">{prefillDestinationName}</strong> has been added to your destinations — feel free to adjust anything below.
          </span>
          <button type="button" onClick={() => setPrefillDestinationName(null)} aria-label="Dismiss" className="shrink-0 text-emerald/60 hover:text-emerald">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      }

      {/* Form Body */}
      <div className="p-8 sm:p-12 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}>

            {step === 0 &&
            <div className="grid gap-6 sm:grid-cols-2">
                <div><label className="mb-2 block text-sm font-medium text-forest">Arrival Date</label><input type="date" value={formData.arrivalDate} onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                <div><label className="mb-2 block text-sm font-medium text-forest">Number of Days</label><input type="number" min={1} value={formData.days} onChange={(e) => setFormData({ ...formData, days: e.target.value })} placeholder="e.g. 10" className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="mb-2 block text-sm font-medium text-forest">Adults</label><input type="number" min={1} value={formData.adults} onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-forest">Children</label><input type="number" min={0} value={formData.children} onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-forest">Infants</label><input type="number" min={0} value={formData.infants} onChange={(e) => setFormData({ ...formData, infants: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-forest">
                  <input type="checkbox" checked={formData.isFlexible} onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })} className="h-4 w-4 rounded border-forest/20 text-emerald focus:ring-emerald" />
                  My travel dates are flexible
                </label>
              </div>
            }

            {step === 1 &&
            <div>
                <p className="mb-6 text-forest/70">Select the destinations you'd love to visit.</p>
                <div className="mb-6">
                  <AutocompleteTagInput
                  label="Search or add a destination"
                  placeholder="e.g. Sigiriya, or type a place not listed…"
                  options={destinations.map((d) => ({ id: d._id, label: d.name }))}
                  selectedIds={formData.selectedDestinations}
                  onSelectedIdsChange={(ids) => setFormData((prev) => ({ ...prev, selectedDestinations: ids }))}
                  customValues={formData.customDestinations}
                  onCustomValuesChange={(values) => setFormData((prev) => ({ ...prev, customDestinations: values }))} />

                </div>
                {destinationsLoading ? <p className="text-sm text-forest/50">Loading destinations…</p> :
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {destinations.map((d) =>
                <div key={d._id} onClick={() => toggleSelection('selectedDestinations', d._id)} className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${formData.selectedDestinations.includes(d._id) ? 'border-emerald shadow-md' : 'border-transparent'}`}>
                      <img src={d.heroImage} alt={d.name} className="h-32 w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 to-transparent p-3 flex flex-col justify-end">
                        <p className="text-sm font-semibold text-white flex items-center gap-1"><MapPinIcon className="w-3 h-3 text-gold" /> {d.name}</p>
                      </div>
                      {formData.selectedDestinations.includes(d._id) && <div className="absolute top-2 right-2 bg-emerald text-white rounded-full p-1"><CheckIcon className="w-3 h-3" /></div>}
                    </div>
                )}
                </div>
              }
              </div>
            }

            {step === 2 &&
            <div>
                <p className="mb-6 text-forest/70">What kind of experiences are you looking for?</p>
                <div className="mb-6">
                  <AutocompleteTagInput
                  label="Search or add an activity"
                  placeholder="e.g. Whale Watching, or type one not listed…"
                  options={activities.map((a) => ({ id: a._id, label: a.name }))}
                  selectedIds={formData.selectedActivities}
                  onSelectedIdsChange={(ids) => setFormData((prev) => ({ ...prev, selectedActivities: ids }))}
                  customValues={formData.customActivities}
                  onCustomValuesChange={(values) => setFormData((prev) => ({ ...prev, customActivities: values }))} />

                </div>
                {activitiesLoading ? <p className="text-sm text-forest/50">Loading activities…</p> :
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {activities.map((a) =>
                <div key={a._id} onClick={() => toggleSelection('selectedActivities', a._id)} className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${formData.selectedActivities.includes(a._id) ? 'border-emerald shadow-md' : 'border-transparent'}`}>
                      <img src={a.image} alt={a.name} className="h-32 w-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 to-transparent p-3 flex flex-col justify-end">
                        <p className="text-sm font-semibold text-white flex items-center gap-1"><TargetIcon className="w-3 h-3 text-gold" /> {a.name}</p>
                      </div>
                      {formData.selectedActivities.includes(a._id) && <div className="absolute top-2 right-2 bg-emerald text-white rounded-full p-1"><CheckIcon className="w-3 h-3" /></div>}
                    </div>
                )}
                </div>
              }
              </div>
            }

            {step === 3 &&
            <div className="space-y-8">
                <div>
                  <label className="mb-3 block font-semibold text-forest">Preferred Hotel Category</label>
                  <div className="flex flex-wrap gap-3">
                    {HOTEL_CATEGORIES.map((opt) =>
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, hotelCategory: opt })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.hotelCategory === opt ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-forest">Meal Preferences</label>
                  <div className="flex flex-wrap gap-3">
                    {MEAL_PREFERENCES.map((opt) =>
                  <button type="button" key={opt} onClick={() => toggleMeal(opt)} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.mealPreferences.includes(opt) ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-forest">Transport Preference</label>
                  <div className="flex flex-wrap gap-3">
                    {TRANSPORT_OPTIONS.map((opt) =>
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, transportPreference: opt })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.transportPreference === opt ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
                </div>
              </div>
            }

            {step === 4 &&
            <div className="space-y-8">
                <div>
                  <label className="mb-3 block font-semibold text-forest">Estimated Budget (USD)</label>
                  <input type="number" min={1} value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="e.g. 2000" className="w-full max-w-xs rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-forest">
                    <input type="checkbox" checked={formData.perPerson} onChange={(e) => setFormData({ ...formData, perPerson: e.target.checked })} className="h-4 w-4 rounded border-forest/20 text-emerald focus:ring-emerald" />
                    This budget is per person
                  </label>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-forest">Travel Style</label>
                  <div className="flex flex-wrap gap-3">
                    {TRAVEL_STYLES.map((opt) =>
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, travelStyle: opt })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.travelStyle === opt ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
                </div>
              </div>
            }

            {step === 5 &&
            <div>
                <label className="mb-3 block font-semibold text-forest">Special Requests & Notes</label>
                <p className="mb-4 text-sm text-forest/60">Dietary requirements, special occasions, wheelchair access, or any specific places you want to ensure are included.</p>
                <textarea rows={6} value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} className="w-full rounded-2xl border border-forest/10 bg-cream/50 p-4 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" placeholder="Tell us more about your dream trip..."></textarea>
              </div>
            }

            {step === 6 &&
            <div className="space-y-5">
                <div className="rounded-2xl bg-cream/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-forest/40">Submitting as</p>
                  <p className="mt-1 font-semibold text-forest">{user.fullName}</p>
                  <p className="text-sm text-forest/60">{user.email}</p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div><dt className="text-forest/50">Arrival</dt><dd className="font-medium text-forest">{formData.arrivalDate || '—'} · {formData.days} days</dd></div>
                  <div><dt className="text-forest/50">Travelers</dt><dd className="font-medium text-forest">{formData.adults} adults, {formData.children} children, {formData.infants} infants</dd></div>
                  <div><dt className="text-forest/50">Destinations</dt><dd className="font-medium text-forest">{formData.selectedDestinations.length + formData.customDestinations.length} selected</dd></div>
                  <div><dt className="text-forest/50">Activities</dt><dd className="font-medium text-forest">{formData.selectedActivities.length + formData.customActivities.length} selected</dd></div>
                  <div><dt className="text-forest/50">Hotel Category</dt><dd className="font-medium text-forest">{formData.hotelCategory}</dd></div>
                  <div><dt className="text-forest/50">Travel Style</dt><dd className="font-medium text-forest">{formData.travelStyle}</dd></div>
                  <div><dt className="text-forest/50">Budget</dt><dd className="font-medium text-forest">{formData.budget ? `$${formData.budget} ${formData.perPerson ? 'per person' : 'total'}` : '—'}</dd></div>
                </dl>

                <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-5">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-2 font-semibold text-forest">
                      <SparklesIcon className="h-4 w-4 text-emerald" /> AI-Drafted Itinerary Preview
                    </p>
                    {aiDraft && !aiLoading &&
                    <button type="button" onClick={generateDraft} className="flex items-center gap-1.5 text-xs font-semibold text-emerald hover:underline">
                        <RefreshCwIcon className="h-3.5 w-3.5" /> Regenerate
                      </button>
                    }
                  </div>

                  {aiLoading &&
                  <div className="mt-4 flex items-center gap-2 text-sm text-forest/60">
                      <Loader2Icon className="h-4 w-4 animate-spin" /> Our AI is drafting your itinerary…
                    </div>
                  }

                  {!aiLoading && aiError &&
                  <div className="mt-4">
                      <p className="text-sm text-red-600">{aiError}</p>
                      <button type="button" onClick={generateDraft} className="mt-2 text-xs font-semibold text-emerald hover:underline">Try again</button>
                    </div>
                  }

                  {!aiLoading && aiDraft &&
                  <div className="mt-4 space-y-3">
                      {aiDraft.summary && <p className="text-sm text-forest/70">{aiDraft.summary}</p>}
                      <div className="space-y-2.5">
                        {aiDraft.days.map((d) =>
                      <div key={d.dayNumber} className="rounded-xl bg-white p-3.5">
                            <p className="text-sm font-semibold text-forest">Day {d.dayNumber}: {d.title}</p>
                            <p className="mt-1 text-xs text-forest/60">{d.schedule}</p>
                            <p className="mt-1.5 text-xs text-forest/50">
                              {d.destinations.length > 0 && <span>{d.destinations.map(destinationName).join(', ')}</span>}
                              {d.activities.length > 0 && <span>{d.destinations.length > 0 ? ' · ' : ''}{d.activities.map(activityName).join(', ')}</span>}
                              {hotelName(d.hotel) && <span>{(d.destinations.length > 0 || d.activities.length > 0) ? ' · ' : ''}{hotelName(d.hotel)}</span>}
                            </p>
                          </div>
                      )}
                      </div>
                      {aiDraft.estimatedTotal &&
                    <div className="flex items-center justify-between border-t border-emerald/15 pt-3 text-sm">
                          <span className="text-forest/60">Estimated total</span>
                          <span className="font-display text-lg font-semibold text-forest">{aiDraft.currency} {aiDraft.estimatedTotal.toLocaleString()}</span>
                        </div>
                    }
                    </div>
                  }

                  {!aiLoading && !aiDraft && !aiError &&
                  <button type="button" onClick={generateDraft} className="mt-4 flex items-center gap-2 rounded-full bg-emerald px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-light">
                      <SparklesIcon className="h-3.5 w-3.5" /> Generate AI Itinerary
                    </button>
                  }
                </div>

                {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}
              </div>
            }
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t border-forest/5 bg-cream/30 px-8 py-6">
        <button onClick={prevStep} disabled={step === 0} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${step === 0 ? 'text-forest/20 cursor-not-allowed' : 'text-forest hover:text-emerald'}`}>
          <ChevronLeftIcon className="h-4 w-4" /> Back
        </button>
        {step < steps.length - 1 ?
        <button onClick={nextStep} className="flex items-center gap-2 rounded-full bg-forest px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald">
            Next Step <ChevronRightIcon className="h-4 w-4" />
          </button> :

        <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-sm font-semibold text-forest transition-transform hover:scale-105 disabled:opacity-70">
            {submitting ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
            Submit Inquiry
          </button>
        }
      </div>
    </div>);

}
