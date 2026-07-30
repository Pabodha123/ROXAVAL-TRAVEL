import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbBackRowProps {
  breadcrumbs: Crumb[];
  className?: string;
}

/**
 * Back button (browser history via navigate(-1)) + breadcrumb trail, styled
 * for light text over a dark/image hero. Shared by every hero-banner page
 * (PageBanner, Destinations, TourPackages, Activities, SearchResults,
 * ActivityDetails, TourPackageDetails, DestinationDetails) so the pattern
 * stays visually identical everywhere instead of being copy-pasted.
 */
export function BreadcrumbBackRow({ breadcrumbs, className = '' }: BreadcrumbBackRowProps) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-2 text-xs font-medium text-cream/80 ${className}`}>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 backdrop-blur transition-colors hover:bg-white/25">
        <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
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
