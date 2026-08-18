import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2Icon, MessageCircleIcon, SendIcon } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/date';

interface MessagingPanelProps {
  requestId: string;
}

function dayLabel(iso: string, todayLabel: string, yesterdayLabel: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(date, today)) return todayLabel;
  if (sameDay(date, yesterday)) return yesterdayLabel;
  return formatDate(date);
}

/**
 * Chat-style conversation thread attached to a custom tour request, shared
 * verbatim by both the customer MyTours page and the admin request detail
 * page — same component, same hook, opposite viewer role.
 */
export function MessagingPanel({ requestId }: MessagingPanelProps) {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { messages, loading, sending, send } = useMessages(requestId);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewerRole = user?.role === 'customer' ? 'customer' : 'admin';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const value = text;
    setText('');
    await send(value);
  };

  let lastDay = '';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <p className="flex items-center gap-2 font-display text-sm font-semibold text-forest">
        <MessageCircleIcon className="h-4 w-4 text-emerald" /> {t('messaging.conversation')}
      </p>

      <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-1">
        {loading && messages.length === 0 &&
        <div className="grid h-24 place-items-center"><Loader2Icon className="h-5 w-5 animate-spin text-forest/30" /></div>
        }
        {!loading && messages.length === 0 &&
        <p className="py-6 text-center text-sm text-forest/40">{t('messaging.noMessages')}</p>
        }
        {messages.map((m) => {
          const isMine = m.senderRole === viewerRole;
          const label = dayLabel(m.createdAt, t('messaging.today'), t('messaging.yesterday'));
          const showDivider = label !== lastDay;
          lastDay = label;
          return (
            <React.Fragment key={m._id}>
              {showDivider &&
              <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-forest/10" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-forest/35">{label}</span>
                  <div className="h-px flex-1 bg-forest/10" />
                </div>
              }
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMine ? 'bg-emerald text-white' : 'bg-cream text-forest'}`}>
                  <p className={`mb-0.5 text-[11px] font-semibold ${isMine ? 'text-white/70' : 'text-forest/50'}`}>
                    {isMine ? t('messaging.you') : m.senderRole === 'admin' ? 'Roxaval Travels' : m.sender?.fullName || t('messaging.customer')}
                  </p>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            </React.Fragment>);

        })}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex items-end gap-2 border-t border-forest/10 pt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={t('messaging.typeMessage')}
          className="flex-1 resize-none rounded-2xl border border-forest/10 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-emerald focus:ring-1 focus:ring-emerald" />

        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald text-white transition-transform hover:scale-105 disabled:opacity-50">
          {sending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>);

}
