import React from 'react';
import { motion } from 'framer-motion';
import { Loader2Icon, SearchXIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react';

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

export function LoadingState({ title = 'Loading…', message }: Partial<StatusStateProps>) {
  return <Frame icon={Loader2Icon} title={title} message={message} spin />;
}

export function EmptyState({ title = 'Nothing found', message = 'Try adjusting your search or filters.', action }: Partial<StatusStateProps>) {
  return <Frame icon={SearchXIcon} title={title} message={message} action={action} />;
}

export function ErrorState({ title = 'Something went wrong', message, action }: Partial<StatusStateProps>) {
  return <Frame icon={TriangleAlertIcon} title={title} message={message || 'Please try again in a moment.'} action={action} />;
}
