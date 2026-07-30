export interface DestinationRef {
  _id: string;
  name: string;
  slug?: string;
  heroImage?: string;
  tag?: string;
}

export interface Activity {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[];
  category: 'Adventure' | 'Wildlife' | 'Culture' | 'Relaxation' | 'Scenic' | 'Water Sports' | 'Nature';
  durationHours: number;
  priceFrom: number;
  destinations: DestinationRef[];
  difficultyLevel: 'Easy' | 'Moderate' | 'Hard';
  location: string;
  bestSeason: string;
  highlights: string[];
  thingsIncluded: string[];
  thingsToBring: string[];
  mapLocation?: { lat: number; lng: number };
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}
