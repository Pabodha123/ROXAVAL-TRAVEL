import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-forest">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-forest/55">{subtitle}</p>}
      </div>
      {action}
    </div>);

}
