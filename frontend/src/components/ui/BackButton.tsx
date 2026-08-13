import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Back button for pages on a light/cream background (no dark hero to
 * overlay) — navigates via browser history, matching BreadcrumbBackRow's
 * behavior on hero-banner pages.
 *
 * Falls back to `fallback` (default '/') instead of blindly calling
 * navigate(-1): a visitor arriving straight from a search result or a
 * shared link has no prior in-app history entry, so history.back() would
 * either do nothing or leave the site entirely. `history.state.idx` is
 * React Router's own in-app navigation counter — 0 means this is the
 * first entry we've pushed, i.e. there's nowhere in-app to go back to.
 */
export function BackButton({ className = '', fallback = '/' }: {className?: string;fallback?: string;}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);else
    navigate(fallback);
  };

  return (
    <button
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-3.5 py-2 text-xs font-semibold text-forest shadow-soft transition-colors hover:bg-cream ${className}`}>

      <ArrowLeftIcon className="h-3.5 w-3.5" /> {t('buttons.back')}
    </button>);

}
