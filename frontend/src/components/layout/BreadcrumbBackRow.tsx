import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbBackRowProps {
  breadcrumbs: Crumb[];
  className?: string;
  fallback?: string;
}

/**
 * Back button (browser history via navigate(-1)) + breadcrumb trail, styled
 * for light text over a dark/image hero. Shared by every hero-banner page
 * (PageBanner, Destinations, TourPackages, Activities, SearchResults,
 * ActivityDetails, TourPackageDetails, DestinationDetails) so the pattern
 * stays visually identical everywhere instead of being copy-pasted.
 *
 * Falls back to `fallback` (default '/') when there's no in-app history to
 * go back to — see BackButton's note on the same history.state.idx check.
 */
export function BreadcrumbBackRow({ breadcrumbs, className = '', fallback = '/' }: BreadcrumbBackRowProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);else
    navigate(fallback);
  };

  return (
    <div className={`flex items-center gap-2 text-xs font-medium text-cream/80 ${className}`}>
      <button onClick={goBack} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 backdrop-blur transition-colors hover:bg-white/25">
        <ArrowLeftIcon className="h-3.5 w-3.5" /> {t('buttons.back')}
      </button>
      <nav className="ml-2 flex flex-wrap items-center gap-1.5">
        {breadcrumbs.map((crumb, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.label}>
              {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
              {isLast || !crumb.href ?
              <span className={isLast ? 'text-white' : ''}>{crumb.label}</span> :

              <Link to={crumb.href} className="hover:text-white">{crumb.label}</Link>
              }
            </React.Fragment>);

        })}
      </nav>
    </div>);

}
