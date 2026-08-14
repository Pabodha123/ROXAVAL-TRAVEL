import { apiGetList } from './api';

export type SearchCategory = 'Tour Packages' | 'Destinations' | 'Activities' | 'Hotels' | 'Blog';

export interface SearchResultItem {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  image?: string;
  href?: string;
}

export interface SearchResults {
  packages: SearchResultItem[];
  destinations: SearchResultItem[];
  activities: SearchResultItem[];
  hotels: SearchResultItem[];
  blog: SearchResultItem[];
}

interface RawPackage {
  _id: string;
  name: string;
  category: string;
  heroImage: string;
  price: number;
  currency: string;
}
interface RawDestination {
  _id: string;
  name: string;
  tag?: string;
  heroImage?: string;
}
interface RawActivity {
  _id: string;
  name: string;
  category: string;
  image: string;
}
interface RawHotel {
  _id: string;
  name: string;
  category: string;
  images?: string[];
}
interface RawBlog {
  _id: string;
  title: string;
  category?: string;
  featuredImage?: string;
}

export const EMPTY_RESULTS: SearchResults = { packages: [], destinations: [], activities: [], hotels: [], blog: [] };

/**
 * Fans out to every public search-enabled catalog endpoint at once. Each
 * request is allowed to fail independently (e.g. a resource temporarily
 * down) without breaking the rest of the results.
 */
export async function searchAll(query: string, limit = 5): Promise<SearchResults> {
  const q = query.trim();
  if (!q) return EMPTY_RESULTS;

  const [packages, destinations, activities, hotels, blog] = await Promise.all([
  apiGetList<RawPackage>('/packages', { q, limit }).
  then(({ data }) => data.map((p): SearchResultItem => ({
    id: p._id,
    category: 'Tour Packages',
    title: p.name,
    subtitle: p.category,
    image: p.heroImage,
    href: `/packages/${p._id}`
  }))).
  catch(() => []),
  apiGetList<RawDestination>('/destinations', { q, limit }).
  then(({ data }) => data.map((d): SearchResultItem => ({
    id: d._id,
    category: 'Destinations',
    title: d.name,
    subtitle: d.tag,
    image: d.heroImage,
    href: '/destinations'
  }))).
  catch(() => []),
  apiGetList<RawActivity>('/activities', { q, limit }).
  then(({ data }) => data.map((a): SearchResultItem => ({
    id: a._id,
    category: 'Activities',
    title: a.name,
    subtitle: a.category,
    image: a.image,
    href: `/activity/${a._id}`
  }))).
  catch(() => []),
  apiGetList<RawHotel>('/hotels', { q, limit }).
  then(({ data }) => data.map((h): SearchResultItem => ({
    id: h._id,
    category: 'Hotels',
    title: h.name,
    subtitle: h.category,
    image: h.images?.[0]
  }))).
  catch(() => []),
  apiGetList<RawBlog>('/blogs', { q, limit }).
  then(({ data }) => data.map((b): SearchResultItem => ({
    id: b._id,
    category: 'Blog',
    title: b.title,
    subtitle: b.category,
    image: b.featuredImage
  }))).
  catch(() => [])]);


  return { packages, destinations, activities, hotels, blog };
}

export function totalResultCount(results: SearchResults): number {
  return results.packages.length + results.destinations.length + results.activities.length + results.hotels.length + results.blog.length;
}
