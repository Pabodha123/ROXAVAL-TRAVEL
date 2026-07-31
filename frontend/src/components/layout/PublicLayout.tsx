import React from 'react';
import { Outlet } from 'react-router-dom';
import { Loader } from '../ui/Loader';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { BirthdayBanner } from './BirthdayBanner';

export function PublicLayout() {
  return (
    <div className="w-full min-h-screen bg-cream flex flex-col">
      <Loader />
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <FloatingWhatsApp />
      <BirthdayBanner />
    </div>);

}
