import React from 'react';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-forest/8 text-forest/50',
  medium: 'bg-gold/15 text-gold',
  high: 'bg-red-50 text-red-600'
};

export function PriorityBadge({ priority }: {priority: string;}) {
  const key = (priority || '').toLowerCase();
  const style = PRIORITY_STYLES[key] || 'bg-forest/8 text-forest/60';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      {priority}
    </span>);

}
