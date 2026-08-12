export interface Review {
  _id: string;
  customer?: { _id: string; user?: { fullName?: string } };
  reviewerName?: string;
  source?: 'website' | 'tripadvisor';
  tourPackage?: { _id: string; name: string; heroImage?: string };
  booking?: string;
  rating: number;
  title: string;
  text: string;
  country: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  isFeatured: boolean;
  createdAt: string;
}

export interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
}
