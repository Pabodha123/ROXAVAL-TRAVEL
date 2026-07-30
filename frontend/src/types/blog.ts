export interface BlogListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  views: number;
  createdAt: string;
}

export interface BlogPost extends BlogListItem {
  content: string;
  gallery: string[];
  author?: { _id: string; user?: { fullName?: string } };
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
}
