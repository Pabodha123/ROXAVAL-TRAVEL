import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2Icon, SaveIcon, TrashIcon } from 'lucide-react';
import { apiGetOne, apiPatch, apiPost, ApiRequestError } from '../../../lib/api';
import { useToast } from '../../components/ToastProvider';
import { PageHeader } from '../../components/PageHeader';
import { TextField, SelectField, TagListInput, ImageUploader, RepeatSection } from '../../components/fields/Fields';
import { TranslatedInput, TranslatedTextarea, emptyLocalizedString, type LocalizedString } from '../../components/fields/TranslatedFields';

interface BlogSectionForm {
  heading: LocalizedString;
  body: LocalizedString;
  image: string;
}

interface BlogPostDetail {
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  sections?: BlogSectionForm[];
  template?: string;
  featuredImage: string;
  gallery: string[];
  category: string;
  tags: string[];
  status: string;
}

const emptySection = (): BlogSectionForm => ({ heading: emptyLocalizedString(), body: emptyLocalizedString(), image: '' });

export function AdminBlogForm() {
  const { id } = useParams<{id: string;}>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState<LocalizedString>(emptyLocalizedString());
  const [excerpt, setExcerpt] = useState<LocalizedString>(emptyLocalizedString());
  const [content, setContent] = useState<LocalizedString>(emptyLocalizedString());
  const [sections, setSections] = useState<BlogSectionForm[]>([]);
  const [template, setTemplate] = useState('default');
  const [featuredImage, setFeaturedImage] = useState<string[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!isEdit) return;
    apiGetOne<BlogPostDetail>(`/blogs/${id}`, { raw: true }).
    then((p) => {
      setTitle(p.title);
      setExcerpt(p.excerpt);
      setContent(p.content);
      setSections(p.sections || []);
      setTemplate(p.template || 'default');
      setFeaturedImage(p.featuredImage ? [p.featuredImage] : []);
      setGallery(p.gallery || []);
      setCategory(p.category);
      setTags(p.tags || []);
      setStatus(p.status);
    }).
    finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateSection = (index: number, patch: Partial<BlogSectionForm>) => {
    setSections((prev) => prev.map((s, i) => i === index ? { ...s, ...patch } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { title, excerpt, content, sections, template, featuredImage: featuredImage[0] || '', gallery, category, tags, status };
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
            <TranslatedInput label="Title" value={title} onChange={setTitle} required />
            <TextField label="Category" value={category} onChange={setCategory} required />
            <SelectField label="Status" value={status} onChange={setStatus} options={[{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }, { label: 'Archived', value: 'archived' }]} />
          </div>
          <div className="mt-4">
            <TranslatedTextarea label="Excerpt" value={excerpt} onChange={setExcerpt} rows={2} required />
          </div>
          <div className="mt-4">
            <TranslatedTextarea label="Content" value={content} onChange={setContent} rows={10} required />
            <p className="mt-1.5 text-xs text-forest/40">Plain paragraphs, used when this post has no numbered Sections below, and for search.</p>
          </div>
          <div className="mt-4">
            <TagListInput label="Tags" value={tags} onChange={setTags} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <p className="mb-1 font-display text-sm font-semibold text-forest">Sections</p>
          <p className="mb-4 text-xs text-forest/45">Optional numbered, illustrated sections (e.g. "1. Minneriya", "2. Pinnawala") shown instead of the plain Content above when at least one is added.</p>
          <div className="mb-4 max-w-xs">
            <SelectField
            label="Layout"
            value={template}
            onChange={setTemplate}
            options={[
            { label: 'Default (numbered magazine grid)', value: 'default' },
            { label: 'Romantic (soft, full-bleed — honeymoon/romance posts)', value: 'romantic' }]} />

          </div>
          <RepeatSection label="" onAdd={() => setSections((prev) => [...prev, emptySection()])} addLabel="Add Section">
            {sections.map((s, i) =>
            <div key={i} className="rounded-xl border border-forest/10 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-forest/50">Section {i + 1}</p>
                  <button type="button" onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700">
                    <TrashIcon className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <TranslatedInput label="Heading" value={s.heading} onChange={(v) => updateSection(i, { heading: v })} />
                <div className="mt-3">
                  <TranslatedTextarea label="Body" value={s.body} onChange={(v) => updateSection(i, { body: v })} rows={5} />
                </div>
                <div className="mt-3">
                  <ImageUploader label="Section Image" value={s.image ? [s.image] : []} onChange={(v) => updateSection(i, { image: v[0] || '' })} multiple={false} />
                </div>
              </div>
            )}
          </RepeatSection>
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
