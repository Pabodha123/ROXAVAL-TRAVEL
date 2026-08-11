import {
  InboxIcon, RefreshCwIcon, SparklesIcon, MessageSquareWarningIcon, HelpCircleIcon,
  CheckCircle2Icon, CalendarPlusIcon, CalendarCheckIcon, CreditCardIcon, BadgeCheckIcon,
  FileTextIcon, StarIcon, CakeIcon, MessageCircleIcon, BellIcon, UserPlusIcon } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NotificationType =
  'welcome' | 'inquiry_received' | 'inquiry_updated' | 'itinerary_ready' | 'changes_requested' |
  'cannot_modify' | 'itinerary_approved' | 'booking_created' | 'booking_confirmed' |
  'payment_submitted' | 'payment_verified' | 'document_ready' | 'review_moderated' |
  'birthday' | 'message_received' | 'general';

interface NotificationTypeMeta {
  icon: LucideIcon;
  // Palette-only — forest/emerald/gold/red, matching the site's brand colors (no blue).
  dot: string;
}

export const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  welcome: { icon: UserPlusIcon, dot: 'bg-gold' },
  inquiry_received: { icon: InboxIcon, dot: 'bg-forest' },
  inquiry_updated: { icon: RefreshCwIcon, dot: 'bg-forest' },
  itinerary_ready: { icon: SparklesIcon, dot: 'bg-emerald' },
  changes_requested: { icon: MessageSquareWarningIcon, dot: 'bg-red-600' },
  cannot_modify: { icon: HelpCircleIcon, dot: 'bg-red-600' },
  itinerary_approved: { icon: CheckCircle2Icon, dot: 'bg-emerald' },
  booking_created: { icon: CalendarPlusIcon, dot: 'bg-gold' },
  booking_confirmed: { icon: CalendarCheckIcon, dot: 'bg-emerald' },
  payment_submitted: { icon: CreditCardIcon, dot: 'bg-gold' },
  payment_verified: { icon: BadgeCheckIcon, dot: 'bg-emerald' },
  document_ready: { icon: FileTextIcon, dot: 'bg-emerald' },
  review_moderated: { icon: StarIcon, dot: 'bg-forest' },
  birthday: { icon: CakeIcon, dot: 'bg-gold' },
  message_received: { icon: MessageCircleIcon, dot: 'bg-forest' },
  general: { icon: BellIcon, dot: 'bg-forest/60' },
};

export function notificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_META[type] || NOTIFICATION_TYPE_META.general;
}
