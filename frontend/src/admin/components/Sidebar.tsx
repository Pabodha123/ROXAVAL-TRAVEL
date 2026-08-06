import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import {
  LayoutDashboardIcon,
  PackageIcon,
  MapPinIcon,
  TargetIcon,
  BedDoubleIcon,
  ClipboardListIcon,
  CreditCardIcon,
  UsersIcon,
  StarIcon,
  NewspaperIcon,
  SettingsIcon,
  CompassIcon,
  FileTextIcon,
  UserIcon,
  CarIcon,
  ArrowLeftRightIcon,
  MailIcon,
  CakeIcon,
  XIcon } from
'lucide-react';

const navGroups = [
{
  label: 'Overview',
  items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon }]
},
{
  label: 'Catalog',
  items: [
  { to: '/admin/packages', label: 'Tour Packages', icon: PackageIcon },
  { to: '/admin/destinations', label: 'Destinations', icon: MapPinIcon },
  { to: '/admin/activities', label: 'Activities', icon: TargetIcon },
  { to: '/admin/hotels', label: 'Hotels', icon: BedDoubleIcon },
  { to: '/admin/tour-guides', label: 'Tour Guides', icon: UserIcon },
  { to: '/admin/vehicles', label: 'Vehicles', icon: CarIcon },
  { to: '/admin/transfers', label: 'Transfers', icon: ArrowLeftRightIcon }]

},
{
  label: 'Operations',
  items: [
  { to: '/admin/bookings', label: 'Bookings', icon: ClipboardListIcon },
  { to: '/admin/payments', label: 'Payments', icon: CreditCardIcon },
  { to: '/admin/customers', label: 'Customers', icon: UsersIcon },
  { to: '/admin/custom-requests', label: 'Custom Tour Inquiries', icon: CompassIcon },
  { to: '/admin/documents', label: 'Documents', icon: FileTextIcon },
  { to: '/admin/contact', label: 'Contact Inquiries', icon: MailIcon },
  { to: '/admin/birthdays', label: 'Birthday Wishes', icon: CakeIcon }]

},
{
  label: 'Content',
  items: [
  { to: '/admin/reviews', label: 'Reviews', icon: StarIcon },
  { to: '/admin/blog', label: 'Blog', icon: NewspaperIcon }]

},
{
  label: 'System',
  items: [{ to: '/admin/settings', label: 'Settings', icon: SettingsIcon }]
}];


interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const customRequestsUnread = useUnreadCount('CustomTourRequest');

  const content =
  <div className="flex h-full flex-col bg-forest text-cream">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <img src="/roxaval-icon.png" alt="" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-semibold text-white">Roxaval<span className="text-gold">.</span></span>
        </div>
        <button onClick={onCloseMobile} className="text-cream/70 hover:text-white lg:hidden">
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
        {navGroups.map((group) =>
      <div key={group.label}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/40">{group.label}</p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) =>
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive ? 'bg-white/10 text-gold' : 'text-cream/80 hover:bg-white/5 hover:text-white'}`
            }>

                  <item.icon className="h-4.5 w-4.5" />
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/admin/custom-requests' && customRequestsUnread > 0 &&
            <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest">
                      {customRequestsUnread > 9 ? '9+' : customRequestsUnread}
                    </span>
            }
                </NavLink>
          )}
            </div>
          </div>
      )}
      </nav>
    </div>;


  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 lg:block">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen &&
      <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-forest/60" onClick={onCloseMobile} />
          <div className="absolute inset-y-0 left-0 w-64">{content}</div>
        </div>
      }
    </>);

}
