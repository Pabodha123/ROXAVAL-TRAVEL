import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

/**
 * Back button for pages on a light/cream background (no dark hero to
 * overlay) — navigates via browser history, matching BreadcrumbBackRow's
 * behavior on hero-banner pages.
 */
export function BackButton({ className = '' }: {className?: string;}) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-3.5 py-2 text-xs font-semibold text-forest shadow-soft transition-colors hover:bg-cream ${className}`}>

      <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
    </button>);

}
