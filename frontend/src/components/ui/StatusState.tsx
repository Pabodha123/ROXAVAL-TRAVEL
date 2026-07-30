import React from 'react';
import { motion } from 'framer-motion';
import { Loader2Icon, SearchXIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

function Frame({ icon: Icon, title, message, action, spin }: StatusStateProps & { spin?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">

      {Icon &&
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-forest/5 text-forest/50">
          <Icon className={`h-6 w-6 ${spin ? 'animate-spin' : ''}`} />
        </span>
      }
      <p className="font-display text-xl font-semibold text-forest">{title}</p>
      {message && <p className="text-sm leading-relaxed text-forest/60">{message}</p>}
      {action}
    </motion.div>);

}

export function LoadingState({ title, message }: Partial<StatusStateProps>) {
  const { t } = useTranslation();
  return <Frame icon={Loader2Icon} title={title ?? t('status.loading')} message={message} spin />;
}

export function EmptyState({ title, message, action }: Partial<StatusStateProps>) {
  const { t } = useTranslation();
  return <Frame icon={SearchXIcon} title={title ?? t('status.noResults')} message={message ?? t('status.noResultsHint')} action={action} />;
}

export function ErrorState({ title, message, action }: Partial<StatusStateProps>) {
  const { t } = useTranslation();
  return <Frame icon={TriangleAlertIcon} title={title ?? t('status.error')} message={message ?? t('status.tryAgainMoment')} action={action} />;
}
