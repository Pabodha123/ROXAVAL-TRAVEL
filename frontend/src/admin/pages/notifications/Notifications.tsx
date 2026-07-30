import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { NotificationsPanel } from '../../../components/notifications/NotificationsPanel';

export function AdminNotifications() {
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Everything that's happened across bookings, inquiries and payments" />
      <div className="max-w-3xl">
        <NotificationsPanel />
      </div>
    </div>);

}
