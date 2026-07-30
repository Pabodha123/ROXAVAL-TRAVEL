import React from 'react';
import { NotificationsPanel } from '../components/notifications/NotificationsPanel';
import { BackButton } from '../components/ui/BackButton';

export function Notifications() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <BackButton className="mb-6" />
        <h1 className="font-display text-3xl font-semibold text-forest sm:text-4xl">Notifications</h1>
        <p className="mt-2 text-forest/60">Everything we've sent you, in one place.</p>
        <div className="mt-8">
          <NotificationsPanel />
        </div>
      </div>
    </main>);

}
