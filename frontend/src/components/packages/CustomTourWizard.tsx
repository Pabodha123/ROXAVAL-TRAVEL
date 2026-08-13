import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ChevronRightIcon, ChevronLeftIcon, MapPinIcon, TargetIcon, SendIcon, LockIcon, Loader2Icon, SparklesIcon, XIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApiList } from '../../hooks/useApiList';
import { apiGetOne, apiPost, ApiRequestError } from '../../lib/api';
import { AutocompleteTagInput } from '../ui/AutocompleteTagInput';
import { DateField } from '../ui/DateField';
import type { DestinationRef } from '../../types/activity';
import type { Activity } from '../../types/activity';
import type { TourPackage } from '../../types/tourPackage';

const steps = [
'Travel Details',
'Destinations',
'Activities',
'Accommodation',
'Transport',
'Review & Submit'];

// Customers think in star ratings, not our internal catalog category names —
// map the ones customers actually ask for onto the existing hotelCategory
// enum so no backend/model change is needed.
const HOTEL_CATEGORIES = [
  { label: '3 Star', value: 'Standard' },
  { label: '4 Star', value: 'Deluxe' },
  { label: '5 Star', value: 'Luxury' }
];
const MEAL_PREFERENCES = ['Breakfast Only', 'Half Board', 'Full Board', 'All Inclusive', 'Vegetarian', 'Vegan', 'Halal', 'No Preference'];
const TRAVEL_STYLES = ['Relaxed', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon', 'Backpacking'];
const TRANSPORT_OPTIONS = ['Private Car', 'Van', 'SUV', 'Minibus', 'No Preference'];
const ROOM_TYPE_OPTIONS = ['No Preference', 'Single', 'Double', 'Twin', 'Triple', 'Family / Quad', 'Suite'];
const SIGHTSEEING_PREFERENCE_OPTIONS = ['Include', 'Exclude', 'No Preference'];

interface FormData {
  arrivalDate: string;
  days: string;
  adults: number;
  children: number;
  infants: number;
  childAges: number[];
  infantAges: number[];
  isFlexible: boolean;
  selectedDestinations: string[];
  selectedActivities: string[];
  customDestinations: string[];
  customActivities: string[];
  hotelCategory: string;
  mealPreferences: string[];
  roomTypePreference: string;
  transportPreference: string;
  guideRequired: boolean;
  sightseeingPreference: string;
  travelStyle: string;
  specialRequests: string;
}

const initialFormData: FormData = {
  arrivalDate: '', days: '7', adults: 2, children: 0, infants: 0, childAges: [], infantAges: [], isFlexible: false,
  selectedDestinations: [], selectedActivities: [],
  customDestinations: [], customActivities: [],
  hotelCategory: 'Standard', mealPreferences: [], roomTypePreference: '',
  transportPreference: 'No Preference', guideRequired: false,
  sightseeingPreference: 'No Preference', travelStyle: 'Relaxed',
  specialRequests: ''
};

export function CustomTourWizard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  // Furthest step the customer has actually reached — lets the progress
  // header act as real navigation (jump back to any completed step, e.g.
  // to tweak Destinations after already moving on to Activities) without
  // allowing a skip-ahead to steps not yet seen.
  const [maxStepReached, setMaxStepReached] = useState(0);
  const wizardRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillPackage, setPrefillPackage] = useState<TourPackage | null>(null);
  const [prefillDestinationName, setPrefillDestinationName] = useState<string | null>(null);

  const { items: destinations, loading: destinationsLoading } = useApiList<DestinationRef>('/destinations', { limit: 100, showInTourForm: true }, 100);
  const { items: activities, loading: activitiesLoading } = useApiList<Activity>('/activities', { limit: 100 }, 100);

  // Keep the ages arrays in sync with the traveler counts — new slots default
  // to a mid-range age, existing entries are preserved when the count shrinks/grows.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, childAges: Array.from({ length: prev.children }, (_, i) => prev.childAges[i] ?? 8) }));
  }, [formData.children]);
  useEffect(() => {
    setFormData((prev) => ({ ...prev, infantAges: Array.from({ length: prev.infants }, (_, i) => prev.infantAges[i] ?? 1) }));
  }, [formData.infants]);

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

  // Once the traveler has picked destinations, narrow the Activities step to only
  // what's actually offered there — otherwise (nothing picked yet) show everything.
  const activitiesForSelectedDestinations = formData.selectedDestinations.length === 0 ?
  activities :
  activities.filter((a) => a.destinations.some((d) => formData.selectedDestinations.includes(d._id)));

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
      travelers: { adults: formData.adults, children: formData.children, infants: formData.infants, childAges: formData.childAges, infantAges: formData.infantAges },
      preferredDestinations: formData.selectedDestinations,
      preferredActivities: formData.selectedActivities,
      customDestinations: formData.customDestinations,
      customActivities: formData.customActivities,
      hotelCategory: formData.hotelCategory,
      mealPreferences: formData.mealPreferences.length ? formData.mealPreferences : ['No Preference'],
      roomTypePreference: formData.roomTypePreference,
      travelStyle: formData.travelStyle,
      transportPreference: formData.transportPreference,
      guideRequired: formData.guideRequired,
      sightseeingPreference: formData.sightseeingPreference,
      specialRequests: formData.specialRequests
    };
  };

  const scrollToTop = () => wizardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const nextStep = () => {
    setStep((s) => {
      const next = Math.min(s + 1, steps.length - 1);
      setMaxStepReached((m) => Math.max(m, next));
      return next;
    });
    scrollToTop();
  };
  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    scrollToTop();
  };
  // Jumping to any already-reached step this way (rather than only via
  // Back/Next one at a time) is what makes the header usable as real
  // navigation — selecting something on step 2 no longer means clicking
  // Back through every step again to get there.
  const goToStep = (i: number) => {
    if (i > maxStepReached) return;
    setStep(i);
    scrollToTop();
  };

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
    if (!formData.arrivalDate || !formData.days) {
      setError('Please fill in travel dates and duration before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiPost('/custom-tours', buildPreferencesPayload());
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
    <div ref={wizardRef} className="rounded-3xl bg-white shadow-lift overflow-hidden max-w-5xl mx-auto">
      {/* Progress Header */}
      <div className="bg-forest px-8 py-6 text-white">
        <h2 className="font-display text-2xl font-semibold">Design Your Dream Tour</h2>
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {steps.map((s, i) =>
          <React.Fragment key={s}>
              <button
              type="button"
              onClick={() => goToStep(i)}
              disabled={i > maxStepReached}
              className={`flex shrink-0 items-center gap-2 text-sm font-medium transition-colors ${i === step ? 'text-gold' : i < step ? 'text-white hover:text-gold' : 'cursor-not-allowed text-white/40'}`}>

                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${i === step ? 'bg-gold text-forest' : i < step ? 'bg-white text-forest' : 'border border-white/40'}`}>
                  {i < step ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {s}
              </button>
              {i < steps.length - 1 && <div className={`h-px w-8 shrink-0 ${i < step ? 'bg-white' : 'bg-white/20'}`} />}
            </React.Fragment>
          )}
        </div>
      </div>

      {prefillPackage &&
      <div className="flex items-center justify-between gap-3 bg-emerald/10 px-8 py-3 text-sm text-emerald">
          <span className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 shrink-0" />
            Pre-filled from <strong className="font-semibold">{prefillPackage.name}</strong> - feel free to adjust anything below.
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
            <strong className="font-semibold">{prefillDestinationName}</strong> has been added to your destinations - feel free to adjust anything below.
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
                <div><label className="mb-2 block text-sm font-medium text-forest">Arrival Date</label><DateField value={formData.arrivalDate} onChange={(v) => setFormData({ ...formData, arrivalDate: v })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                <div><label className="mb-2 block text-sm font-medium text-forest">Number of Days</label><input type="number" min={1} value={formData.days} onChange={(e) => setFormData({ ...formData, days: e.target.value })} placeholder="e.g. 10" className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="mb-2 block text-sm font-medium text-forest">Adults</label><input type="number" min={1} value={formData.adults} onChange={(e) => setFormData({ ...formData, adults: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-forest">Children <span className="font-normal text-forest/40">(5-11)</span></label><input type="number" min={0} value={formData.children} onChange={(e) => setFormData({ ...formData, children: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-forest">Infants <span className="font-normal text-forest/40">(under 5)</span></label><input type="number" min={0} value={formData.infants} onChange={(e) => setFormData({ ...formData, infants: Number(e.target.value) })} className="w-full rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" /></div>
                </div>
                {formData.childAges.length > 0 &&
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-forest">Children's Ages <span className="font-normal text-forest/50">(helps us set up the right room & bed configuration)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {formData.childAges.map((age, i) =>
                    <input
                      key={i}
                      type="number"
                      min={5}
                      max={11}
                      value={age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, childAges: prev.childAges.map((a, idx) => idx === i ? Number(e.target.value) || 0 : a) }))}
                      className="w-20 rounded-xl border border-forest/10 bg-cream/50 px-3 py-2.5 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />

                    )}
                    </div>
                  </div>
                }
                {formData.infantAges.length > 0 &&
                <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-forest">Infants' Ages <span className="font-normal text-forest/50">(in years)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {formData.infantAges.map((age, i) =>
                    <input
                      key={i}
                      type="number"
                      min={0}
                      max={4}
                      value={age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, infantAges: prev.infantAges.map((a, idx) => idx === i ? Number(e.target.value) || 0 : a) }))}
                      className="w-20 rounded-xl border border-forest/10 bg-cream/50 px-3 py-2.5 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />

                    )}
                    </div>
                  </div>
                }
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
                <p className="text-forest/70">What kind of experiences are you looking for?</p>
                <p className="mb-6 text-xs text-forest/45">
                  {formData.selectedDestinations.length > 0 ?
                'Showing activities available in your selected destinations.' :
                'Pick destinations in the previous step to narrow this list down.'}
                </p>
                <div className="mb-6">
                  <AutocompleteTagInput
                  label="Search or add an activity"
                  placeholder="e.g. Whale Watching, or type one not listed…"
                  options={activitiesForSelectedDestinations.map((a) => ({ id: a._id, label: a.name }))}
                  selectedIds={formData.selectedActivities}
                  onSelectedIdsChange={(ids) => setFormData((prev) => ({ ...prev, selectedActivities: ids }))}
                  customValues={formData.customActivities}
                  onCustomValuesChange={(values) => setFormData((prev) => ({ ...prev, customActivities: values }))} />

                </div>
                {activitiesLoading ? <p className="text-sm text-forest/50">Loading activities…</p> :
              activitiesForSelectedDestinations.length === 0 ?
              <p className="text-sm text-forest/50">No catalog activities found for your selected destinations yet - you can still add one by typing its name above.</p> :

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {activitiesForSelectedDestinations.map((a) =>
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
                  <button type="button" key={opt.value} onClick={() => setFormData({ ...formData, hotelCategory: opt.value })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.hotelCategory === opt.value ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt.label}</button>
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
                  <label className="mb-2 block text-sm font-medium text-forest">Room Type</label>
                  <select value={formData.roomTypePreference} onChange={(e) => setFormData({ ...formData, roomTypePreference: e.target.value })} className="w-full max-w-sm rounded-xl border border-forest/10 bg-cream/50 px-4 py-3 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald">
                    <option value="">Select a room type…</option>
                    {ROOM_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-forest">Would you like sightseeing &amp; activities included in your quote?</label>
                  <p className="mb-3 text-sm text-forest/50">This helps us quote you accurately - you can arrange your own sightseeing to lower the cost, or have us include it all.</p>
                  <div className="flex flex-wrap gap-3">
                    {SIGHTSEEING_PREFERENCE_OPTIONS.map((opt) =>
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, sightseeingPreference: opt })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.sightseeingPreference === opt ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
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

            {step === 4 &&
            <div className="space-y-8">
                <div>
                  <label className="mb-3 block font-semibold text-forest">Vehicle Type</label>
                  <div className="flex flex-wrap gap-3">
                    {TRANSPORT_OPTIONS.map((opt) =>
                  <button type="button" key={opt} onClick={() => setFormData({ ...formData, transportPreference: opt })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.transportPreference === opt ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt}</button>
                  )}
                  </div>
                </div>
                <div>
                  <label className="mb-3 block font-semibold text-forest">Guide Required?</label>
                  <div className="flex flex-wrap gap-3">
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map((opt) =>
                  <button type="button" key={opt.label} onClick={() => setFormData({ ...formData, guideRequired: opt.value })} className={`rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${formData.guideRequired === opt.value ? 'bg-emerald text-white' : 'bg-cream text-forest hover:bg-emerald/10'}`}>{opt.label}</button>
                  )}
                  </div>
                </div>
              </div>
            }

            {step === 5 &&
            <div className="space-y-5">
                <div className="rounded-2xl bg-cream/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-forest/40">Submitting as</p>
                  <p className="mt-1 font-semibold text-forest">{user.fullName}</p>
                  <p className="text-sm text-forest/60">{user.email}</p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div><dt className="text-forest/50">Arrival</dt><dd className="font-medium text-forest">{formData.arrivalDate || '-'} · {formData.days} days</dd></div>
                  <div><dt className="text-forest/50">Travelers</dt><dd className="font-medium text-forest">{formData.adults} adults, {formData.children} children, {formData.infants} infants</dd></div>
                  <div><dt className="text-forest/50">Destinations</dt><dd className="font-medium text-forest">{formData.selectedDestinations.length + formData.customDestinations.length} selected</dd></div>
                  <div><dt className="text-forest/50">Activities</dt><dd className="font-medium text-forest">{formData.selectedActivities.length + formData.customActivities.length} selected</dd></div>
                  <div><dt className="text-forest/50">Hotel Category</dt><dd className="font-medium text-forest">{HOTEL_CATEGORIES.find((c) => c.value === formData.hotelCategory)?.label || formData.hotelCategory}</dd></div>
                  <div><dt className="text-forest/50">Room Type</dt><dd className="font-medium text-forest">{formData.roomTypePreference || '-'}</dd></div>
                  <div><dt className="text-forest/50">Travel Style</dt><dd className="font-medium text-forest">{formData.travelStyle}</dd></div>
                  <div><dt className="text-forest/50">Vehicle Type</dt><dd className="font-medium text-forest">{formData.transportPreference}</dd></div>
                  <div><dt className="text-forest/50">Guide Required</dt><dd className="font-medium text-forest">{formData.guideRequired ? 'Yes' : 'No'}</dd></div>
                  <div><dt className="text-forest/50">Sightseeing Included</dt><dd className="font-medium text-forest">{formData.sightseeingPreference}</dd></div>
                </dl>

                <div>
                  <label className="mb-3 block font-semibold text-forest">Special Requests & Notes</label>
                  <p className="mb-4 text-sm text-forest/60">Dietary requirements, special occasions, wheelchair access, or any specific places you want to ensure are included.</p>
                  <textarea rows={4} value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} className="w-full rounded-2xl border border-forest/10 bg-cream/50 p-4 outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" placeholder="Tell us more about your dream trip..."></textarea>
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
