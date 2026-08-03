import React from 'react';

const STATUS_STYLES: Record<string, string> = {
  // generic content status
  published: 'bg-emerald/10 text-emerald',
  active: 'bg-emerald/10 text-emerald',
  approved: 'bg-emerald/10 text-emerald',
  verified: 'bg-emerald/10 text-emerald',
  confirmed: 'bg-emerald/10 text-emerald',
  completed: 'bg-forest/10 text-forest',
  draft: 'bg-forest/8 text-forest/60',
  inactive: 'bg-forest/8 text-forest/60',
  archived: 'bg-forest/8 text-forest/50',
  pending: 'bg-gold/15 text-gold',
  'pending review': 'bg-gold/15 text-gold',
  'under review': 'bg-gold/15 text-gold',
  'awaiting approval': 'bg-gold/15 text-gold',
  'awaiting customer approval': 'bg-gold/15 text-gold',
  'booking confirmed': 'bg-emerald/10 text-emerald',
  generated: 'bg-emerald/10 text-emerald',
  sent: 'bg-emerald/10 text-emerald',
  'changes requested': 'bg-gold/15 text-gold',
  accepted: 'bg-emerald/10 text-emerald',
  superseded: 'bg-forest/8 text-forest/50',
  'payment pending': 'bg-gold/15 text-gold',
  'payment verification': 'bg-gold/15 text-gold',
  submitted: 'bg-gold/15 text-gold',
  new: 'bg-gold/15 text-gold',
  read: 'bg-forest/8 text-forest/60',
  responded: 'bg-emerald/10 text-emerald',
  rejected: 'bg-red-50 text-red-600',
  cancelled: 'bg-red-50 text-red-600',
  refunded: 'bg-red-50 text-red-600'
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const style = STATUS_STYLES[key] || 'bg-forest/8 text-forest/60';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {status}
    </span>);

}
