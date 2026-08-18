import type { DestinationRef } from './activity';

export interface ActivityRef {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  category?: string;
}

export interface HotelRef {
  _id: string;
  name: string;
  slug?: string;
  category?: string;
  starRating?: number;
  images?: string[];
  address?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  destinations?: DestinationRef[];
  activities?: ActivityRef[];
  hotel?: HotelRef;
  meals?: ('Breakfast' | 'Lunch' | 'Dinner')[];
}

export interface TourPackage {
  _id: string;
  name: string;
  slug: string;
  category: 'Best Seller' | 'Scenic' | 'Adventure' | 'Relax' | 'Luxury' | 'Signature' | 'Honeymoon' | 'Family' | 'Wildlife';
  tourType: 'Private' | 'Group';
  heroImage: string;
  gallery: string[];
  destinations: DestinationRef[];
  activities: ActivityRef[];
  hotels: HotelRef[];
  durationDays: number;
  durationNights: number;
  itinerary: ItineraryDay[];
  includedServices: string[];
  excludedServices: string[];
  description: string;
  highlights: string[];
  price: number;
  discountPrice?: number;
  childPricePercent?: number;
  currency: string;
  minTravelers: number;
  maxTravelers: number;
  rating: number;
  reviewsCount: number;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  showPrice: boolean;
  pricePerPerson: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  rating: number;
  title?: string;
  text: string;
  country?: string;
  customer?: { user?: { fullName?: string } };
  reviewerName?: string;
  source?: 'website' | 'tripadvisor';
  createdAt: string;
}
