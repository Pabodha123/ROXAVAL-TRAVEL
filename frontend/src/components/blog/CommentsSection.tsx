import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleIcon, SendIcon, TrashIcon, UserCircleIcon } from 'lucide-react';
import { apiGetList, apiPost, apiDelete, ApiRequestError } from '../../lib/api';
import { formatDateLong as formatDate } from '../../lib/date';
import { useAuth } from '../../context/AuthContext';
import type { BlogComment } from '../../types/blog';

export function CommentsSection({ blogId }: { blogId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    apiGetList<BlogComment>(`/blogs/${blogId}/comments`).
    then(({ data }) => setComments(data)).
    catch(() => {}).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError('');
    try {
      await apiPost(`/blogs/${blogId}/comments`, { text: text.trim() });
      setText('');
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Failed to post comment.');
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id: string) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
    await apiDelete(`/blog-comments/${id}`).catch(() => load());
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-forest">
        <MessageCircleIcon className="h-5 w-5 text-emerald" /> Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {user?.role === 'customer' ?
      <form onSubmit={submit} className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft">
          <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          maxLength={2000}
          className="w-full resize-none rounded-xl border border-forest/15 px-4 py-3 text-sm text-forest outline-none focus:border-emerald" />

          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={posting || !text.trim()} className="flex items-center gap-2 self-end rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-cream hover:bg-emerald disabled:opacity-50">
            <SendIcon className="h-4 w-4" /> {posting ? 'Posting…' : 'Post Comment'}
          </button>
        </form> :

      <div className="mt-5 rounded-2xl bg-cream p-5 text-sm text-forest/60">
          <Link to="/auth" className="font-semibold text-emerald hover:underline">Log in</Link> to join the conversation.
        </div>
      }

      <div className="mt-6 space-y-4">
        {!loading && comments.length === 0 &&
        <p className="text-sm text-forest/40">No comments yet — be the first to share your thoughts.</p>
        }
        {comments.map((c) =>
        <div key={c._id} className="flex gap-3 rounded-2xl bg-white p-5 shadow-soft">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald/10 text-emerald"><UserCircleIcon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-forest">{c.customer?.user?.fullName || 'Traveler'}</p>
                <div className="flex items-center gap-2">
                  <p className="shrink-0 text-xs text-forest/40">{formatDate(c.createdAt)}</p>
                  {(user?.role === 'admin' || user?.role === 'superadmin') &&
                <button onClick={() => remove(c._id)} aria-label="Delete comment" className="text-forest/30 hover:text-red-500"><TrashIcon className="h-3.5 w-3.5" /></button>
                }
                </div>
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-forest/70">{c.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>);

}
