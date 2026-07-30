import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon } from 'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, TextAreaField, SelectField, TagListInput, ImageUploader } from '../../components/fields/Fields';

interface BlogPostDetail {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery: string[];
  category: string;
  tags: string[];
  status: string;
}

export function AdminBlogForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<BlogPostDetail>(`/blogs/${id}`).
    then((p) => {
      setTitle(p.title);
      setExcerpt(p.excerpt);
      setContent(p.content);
      setFeaturedImage(p.featuredImage ? [p.featuredImage] : []);
      setGallery(p.gallery || []);
      setCategory(p.category);
      setTags(p.tags || []);
      setStatus(p.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title, excerpt, content, featuredImage: featuredImage[0] || '', gallery, category, tags, status };
    try {
      if (isEdit) {
        await apiPatch(`/blogs/${id}`, payload);
        toast('Post updated.');
      } else {
        await apiPost('/blogs', payload);
        toast('Post created.');
      }
      navigate('/admin/blog');
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to save post.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid h-64 place-items-center"><Loader2Icon className="h-6 w-6 animate-spin text-forest/40" /></div>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit Post' : 'Add Post'} subtitle="Share stories and guides with travelers" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Title" value={title} onChange={setTitle} required />
            <TextField label="Category" value={category} onChange={setCategory} required />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }]} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Excerpt" value={excerpt} onChange={setExcerpt} rows={2} required />
          </div>
          <div className="mt-4">
            <TextAreaField label="Content" value={content} onChange={setContent} rows={10} required />
          </div>
          <div className="mt-4">
            <TagListInput label="Tags" value={tags} onChange={setTags} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-4 font-display text-sm font-semibold text-forest">Media</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploader label="Featured Image" value={featuredImage} onChange={setFeaturedImage} multiple={false} />
            <ImageUploader label="Gallery" value={gallery} onChange={setGallery} />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/blog')} className="rounded-full border border-forest/15 px-6 py-3 text-sm font-semibold text-forest hover:bg-cream">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-70">
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
            {isEdit ? 'Save Changes' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>);

}
