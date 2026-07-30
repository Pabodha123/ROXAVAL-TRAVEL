import React from 'react';
import { Hero } from '../components/sections/Hero';
import { Destinations } from '../components/sections/Destinations';
import { Packages } from '../components/sections/Packages';
import { CustomTourCta } from '../components/sections/CustomTourCta';
import { Activities } from '../components/sections/Activities';
import { Stats } from '../components/sections/Stats';
import { WhyChoose } from '../components/sections/WhyChoose';
import { Reviews } from '../components/sections/Reviews';
import { Blog } from '../components/sections/Blog';

export function Home() {
  return (
    <main>
      <Hero />
      <Destinations />
      <Packages />
      <CustomTourCta />
      <Activities />
      <Stats />
      <WhyChoose />
      <Reviews />
      <Blog />
    </main>);

}