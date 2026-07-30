import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, PlusIcon, PowerIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { useAdminList } from '../../hooks/useAdminList';
import { DataTable, Column } from '../../components/DataTable';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useConfirm } from '../../components/ConfirmDialog';
import { useToast } from '../../components/ToastProvider';
import { apiDelete, apiPatch, ApiRequestError } from '../../../lib/api';

interface AdminBlogPost {
  _id: string;
  title: string;
  featuredImage: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
}

export function AdminBlogList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { items, meta, loading, error, page, setPage, refetch } = useAdminList<AdminBlogPost>('/blogs/admin/all', {
    q: search || undefined,
    status: status || undefined
  });
  const confirm = useConfirm();
  const toast = useToast();

  const togglePublish = async (post: AdminBlogPost) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    try {
      await apiPatch(`/blogs/${post._id}`, { status: next });
      toast(`Post ${next === 'published' ? 'published' : 'unpublished'}.`);
      refetch();
    } catch (err) {
      toast(err instanceof ApiRequestError ? err.message : 'Failed to update post.', 'error');
    }
  };

  const remove = (post: AdminBlogPost) => {
    confirm({
      title: 'Delete post?',
      message: `"${post.title}" will be permanently removed.`,
      confirmLabel: 'Delete',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await apiDelete(`/blogs/${post._id}`);
          toast('Post deleted.');
          refetch();
        } catch (err) {
          toast(err instanceof ApiRequestError ? err.message : 'Failed to delete post.', 'error');
        }
      }
    });
  };

  const columns: Column<AdminBlogPost>[] = [
  { header: 'Post', render: (p) => <div className="flex items-center gap-3"><img src={p.featuredImage} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="max-w-xs truncate font-medium">{p.title}</span></div> },
  { header: 'Category', render: (p) => p.category },
  { header: 'Views', render: (p) => p.views },
  { header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  {
    header: 'Actions',
    render: (p) =>
    <div className="flex items-center gap-1.5">
          <Link to={`/admin/blog/${p._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PencilIcon className="h-4 w-4" /></Link>
          <button onClick={() => togglePublish(p)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-cream hover:text-forest"><PowerIcon className="h-4 w-4" /></button>
          <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center rounded-lg text-forest/60 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>
        </div>

  }];


  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle="Publish stories, guides and travel inspiration"
        action={
        <Link to="/admin/blog/new" className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald">
            <PlusIcon className="h-4 w-4" /> Add Post
          </Link>
        } />


      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts…" className="w-full rounded-xl border border-forest/15 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-forest/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <DataTable columns={columns} rows={items} loading={loading} error={error} meta={meta} page={page} onPageChange={setPage} rowKey={(p) => p._id} emptyMessage="No posts yet." />
    </div>);

}
