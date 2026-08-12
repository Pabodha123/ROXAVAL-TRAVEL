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

export interface BlogSection {
  heading: string;
  body: string;
  image: string;
}

export interface BlogPost extends BlogListItem {
  content: string;
  sections: BlogSection[];
  template?: 'default' | 'romantic';
  gallery: string[];
  author?: { _id: string; user?: { fullName?: string } };
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
}
