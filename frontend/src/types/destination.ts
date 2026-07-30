export type DestinationCategory = 'Cultural' | 'Wildlife' | 'Beach' | 'Hill Country' | 'City' | 'Nature' | 'Adventure';

export interface Attraction {
  _id: string;
  name: string;
  description: string;
  images: string[];
  bestVisitingMonths: string[];
  estimatedVisitDuration: string;
  googleMapsLink: string;
  travelTips: string[];
  entryFee: number;
}

export interface DestinationListItem {
  _id: string;
  name: string;
  slug: string;
  tag: DestinationCategory;
  region?: string;
  description: string;
  heroImage: string;
  isFeatured: boolean;
}

export interface Destination extends DestinationListItem {
  gallery: string[];
  attractions: Attraction[];
  history: string;
  whyVisit: string[];
  popularActivities: string[];
  bestTimeToVisit: string;
  openingHours: string;
  entranceFee: { amount: number; currency: string; notes: string };
  travelTips: string[];
  nearbyDestinations: DestinationListItem[];
  mapLocation?: { lat: number; lng: number };
  status: 'draft' | 'published' | 'archived';
}
