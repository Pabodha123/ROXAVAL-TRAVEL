import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-forest/50 transition-colors hover:text-forest">

        <ArrowLeftIcon className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-forest/55">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>);

}
