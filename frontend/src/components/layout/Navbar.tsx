
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  HomeIcon, PackageIcon, MapPinIcon, TargetIcon, BriefcaseIcon,
  ChevronDownIcon, SearchIcon, UserIcon, MenuIcon, XIcon,
  UserCircleIcon, SettingsIcon, LogOutIcon } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { NotificationBell } from './NotificationBell';
import { SearchOverlay } from './SearchOverlay';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const myToursUnread = useUnreadCount('CustomTourRequest', Boolean(user));
  const isHome = location.pathname === '/';

  const mainLinks = [
    { label: t('nav.home'), icon: HomeIcon, href: '/' },
    { label: t('nav.packages'), icon: PackageIcon, href: '/packages' },
    { label: t('nav.destinations'), icon: MapPinIcon, href: '/destinations' },
    { label: t('nav.activities'), icon: TargetIcon, href: '/activities' },
    { label: t('nav.myTours'), icon: BriefcaseIcon, href: '/my-tours' },
  ];

  const exploreLinks = [
    { label: t('nav.aboutUs'), href: '/about' },
    { label: t('nav.contactUs'), href: '/contact' },
    { label: t('nav.blog'), href: '/blog' },
    { label: t('nav.reviews'), href: '/reviews' },
    { label: t('nav.terms'), href: '/terms' },
  ];

  const userMenuLinks = [
    { label: t('nav.myTours'), href: '/my-tours', icon: BriefcaseIcon },
    { label: t('nav.profile'), href: '/profile', icon: UserCircleIcon },
    { label: t('nav.settings'), href: '/account-settings', icon: SettingsIcon },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // The Explore dropdown only closes on mouse-leave, which a click that
  // navigates away doesn't reliably trigger (especially on touch, where
  // there's no hover state to leave in the first place) — leaving it
  // stuck open on whatever page it navigated to. Same guarantee for the
  // mobile menu and user menu: a route change should always close them.
  useEffect(() => {
    setExploreOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const solid = !isHome || scrolled || mobileOpen;

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      solid ? 'bg-forest/95 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'}`
      }>
      
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Roxaval Travels home">
          <img src="/roxaval-icon.png" alt="" className="h-10 w-10 object-contain" />
          <span className="font-display text-xl font-semibold text-white leading-none">
            Roxaval<span className="text-gold">.</span>
            <span className="block text-[10px] font-sans font-medium tracking-[0.3em] text-cream/70 uppercase">Travels</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {mainLinks.map((link) => {
            const isActive = location.pathname === link.href || link.href !== '/' && location.pathname.startsWith(link.href);

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                isActive ? 'text-gold' : 'text-cream/90 hover:text-white'}`
                }>

                {link.label}
                {link.href === '/my-tours' && myToursUnread > 0 &&
                <span className="grid h-4.5 min-w-[1.125rem] place-items-center rounded-full bg-gold px-1 text-[9px] font-bold text-forest">
                    {myToursUnread > 9 ? '9+' : myToursUnread}
                  </span>
                }
                {isActive &&
                <motion.span layoutId="nav-active" className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                }
              </Link>);

          })}

          {/* Explore dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}>
            
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-cream/90 hover:text-white rounded-full transition-colors">
              {t('nav.explore')}
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {exploreOpen &&
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-lift p-2 overflow-hidden">
                
                  {exploreLinks.map((l) =>
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => setExploreOpen(false)}
                  className="block px-4 py-2.5 text-sm text-forest/80 rounded-xl hover:bg-cream hover:text-emerald transition-colors">

                      {l.label}
                    </Link>
                )}
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-2">
          <LanguageSwitcher variant="dark" />
          <button onClick={() => setSearchOpen(true)} aria-label={t('nav.search')} className="p-2.5 rounded-full text-cream/90 hover:bg-white/10 hover:text-white transition-colors">
            <SearchIcon className="h-5 w-5" />
          </button>
          {user && <NotificationBell />}

          {user ?
          <div className="relative ml-1" ref={userMenuRef}>
              <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3.5 transition-colors hover:bg-white/15">

                <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-xs font-bold text-forest">
                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="text-sm font-medium text-white">{user.fullName.split(' ')[0]}</span>
                <ChevronDownIcon className={`h-3.5 w-3.5 text-cream/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen &&
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-lift p-2 overflow-hidden">

                    {userMenuLinks.map((item) =>
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-forest/80 rounded-xl hover:bg-cream hover:text-emerald transition-colors">

                        <item.icon className="h-4 w-4" /> {item.label}
                      </Link>
                )}
                    <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors">

                      <LogOutIcon className="h-4 w-4" /> {t('nav.logout')}
                    </button>
                  </motion.div>
              }
              </AnimatePresence>
            </div> :

          <Link
            to="/auth"
            className="ml-1 flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-forest shadow-soft transition-transform hover:scale-[1.04] active:scale-95">

              <UserIcon className="h-4 w-4" />
              {t('nav.loginRegister')}
            </Link>
          }
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 rounded-lg text-white"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t('nav.toggleMenu')}
          aria-expanded={mobileOpen}>
          
          {mobileOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden">
          
            <div className="px-4 sm:px-6 py-4 space-y-1">
              {mainLinks.map((link) => {
              const isActive = location.pathname === link.href || link.href !== '/' && location.pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-gold' : 'text-cream/90 hover:bg-white/5'}`
                  }>

                    <link.icon className="h-4 w-4" />
                    <span className="flex-1">{link.label}</span>
                    {link.href === '/my-tours' && myToursUnread > 0 &&
                  <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest">
                        {myToursUnread > 9 ? '9+' : myToursUnread}
                      </span>
                  }
                  </Link>);

            })}
              <div className="pt-2 mt-2 border-t border-white/10">
                <p className="px-4 py-2 text-[11px] uppercase tracking-widest text-cream/50">{t('nav.explore')}</p>
                {exploreLinks.map((l) =>
              <Link key={l.label} to={l.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm text-cream/80 rounded-xl hover:bg-white/5">
                    {l.label}
                  </Link>
              )}
              </div>
              {user &&
              <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gold text-sm font-bold text-forest">
                      {user.fullName?.[0]?.toUpperCase() || 'U'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.fullName}</p>
                      <p className="text-xs text-cream/50">{user.email}</p>
                    </div>
                  </div>
                  {userMenuLinks.map((item) =>
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cream/90 hover:bg-white/5">

                      <item.icon className="h-4 w-4" /> {item.label}
                    </Link>
                )}
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-white/5">
                    <LogOutIcon className="h-4 w-4" /> {t('nav.logout')}
                  </button>
                </div>
              }
              <div className="flex items-center gap-2 pt-3">
                {!user &&
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-forest">

                    <UserIcon className="h-4 w-4" /> {t('nav.loginRegister')}
                  </Link>
                }
                <button onClick={() => { setMobileOpen(false); setSearchOpen(true); }} aria-label={t('nav.search')} className="p-3 rounded-full bg-white/10 text-white"><SearchIcon className="h-5 w-5" /></button>
                <LanguageSwitcher variant="dark" className="[&>button]:bg-white/10 [&>button]:p-3" />
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </motion.header>);

}