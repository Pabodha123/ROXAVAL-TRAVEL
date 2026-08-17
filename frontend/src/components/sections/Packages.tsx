import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, Loader2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGetList } from '../../lib/api';
import { PackageCard } from '../packages/PackageCard';
import { SectionHeading } from '../ui/SectionHeading';
import type { TourPackage } from '../../types/tourPackage';

export function Packages() {
  const { t } = useTranslation('home');
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    apiGetList<TourPackage>('/packages', { isFeatured: true, limit: 8, sort: '-rating' }).
    then(async ({ data }) => {
      // Admin hasn't marked anything "Feature on homepage" yet — fall back to
      // the newest published packages so the section is never empty.
      if (!cancelled && data.length === 0) {
        const fallback = await apiGetList<TourPackage>('/packages', { limit: 8, sort: '-createdAt' });
        if (!cancelled) setPackages(fallback.data);
        return;
      }
      if (!cancelled) setPackages(data);
    }).
    catch(() => {}).
    finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && packages.length === 0) return null;

  return (
    <section id="packages" className="relative py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('packages.eyebrow')}
          title={t('packages.title')}
          subtitle={t('packages.subtitle')} />

        {loading ?
        <div className="mt-14 grid h-64 place-items-center">
            <Loader2Icon className="h-6 w-6 animate-spin text-forest/40" />
          </div> :

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, i) => <PackageCard key={pkg._id} pkg={pkg} index={i} compact />)}
          </div>
        }

        <div className="mt-12 flex justify-center">
          <Link
            to="/packages"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald">

            {t('packages.viewAllPackages')}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>);

}
