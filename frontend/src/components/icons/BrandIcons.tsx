import React from 'react';

// lucide-react ships generic icons only, no brand marks — these fill the gap
// for TikTok/TripAdvisor in the same stroke-outline style as the surrounding
// lucide icons (Facebook/Instagram/etc.) so they blend in visually.

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V2c.6 2.8 2.6 4.8 5.5 5.2" />
    </svg>
  );
}

export function TripAdvisorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 9c3-2 6-2 10-2s7 0 10 2" />
      <circle cx="7" cy="14" r="3.5" />
      <circle cx="17" cy="14" r="3.5" />
      <path d="M10.5 12.5 12 10l1.5 2.5" />
    </svg>
  );
}
