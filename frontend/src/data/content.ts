
export interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  tag: string;
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const destinations: Destination[] = [
{
  id: 'sigiriya',
  name: 'Sigiriya',
  image: "/destination-sigiriya.jpg",
  description: 'Climb the legendary Lion Rock fortress rising above emerald jungle, crowned with ancient frescoes and royal gardens.',
  tag: 'Cultural Triangle'
},
{
  id: 'kandy',
  name: 'Kandy',
  image: "/destination-kandy.jpg",
  description: 'The hill capital wrapped around a serene lake, home to the sacred Temple of the Tooth and lush botanical gardens.',
  tag: 'Hill Country'
},
{
  id: 'ella',
  name: 'Ella',
  image: "/28226e86-8f8e-4d79-b1fa-e1c155bc045c.jpg",
  description: 'A misty mountain village famed for the Nine Arch Bridge, tea trails and sweeping valley sunrises.',
  tag: 'Hill Country'
},
{
  id: 'nuwara-eliya',
  name: 'Nuwara Eliya',
  image: "/470f58a2-b8ec-4c53-b2fe-62c6f0cbb506.jpg",
  description: 'Little England amid endless tea plantations, colonial charm and cool, fragrant mountain air.',
  tag: 'Tea Country'
},
{
  id: 'yala',
  name: 'Yala',
  image: "/60b4c194-d3e8-44d7-8a8c-b9d58a908c56.jpg",
  description: 'The island\u2019s wildest frontier, where leopards, elephants and painted savannas make every safari unforgettable.',
  tag: 'Wildlife'
},
{
  id: 'galle',
  name: 'Galle',
  image: "/a11c5b41-970d-4c2e-bc21-b12bbb96bc44.jpg",
  description: 'A UNESCO fort city of cobbled lanes, colonial ramparts and ocean sunsets steeped in centuries of history.',
  tag: 'South Coast'
},
{
  id: 'mirissa',
  name: 'Mirissa',
  image: "/5173712e-19bd-4ede-810a-b1fd443e9ef1.jpg",
  description: 'A palm-fringed crescent bay for whale watching, golden sunsets and laid-back tropical bliss.',
  tag: 'South Coast'
},
{
  id: 'bentota',
  name: 'Bentota',
  image: "/09458834-a156-4b05-8dc9-c0c7c2c90a20.jpg",
  description: 'Golden beaches, river safaris and luxury resorts make this the perfect gateway to the west coast.',
  tag: 'West Coast'
}];


export const activities: Activity[] = [
{
  id: 'safari',
  name: 'Wildlife Safari',
  image: "/activity-wildlife-safari.jpg",
  description: 'Spot leopards, elephants and exotic birds in Yala and Udawalawe national parks.'
},
{
  id: 'train',
  name: 'Scenic Train Journey',
  image: "/activity-scenic-train.jpg",
  description: 'Ride the world\u2019s most beautiful railway through misty tea-covered hills.'
},
{
  id: 'whale',
  name: 'Whale Watching',
  image: "/activity-whale-watching.jpg",
  description: 'Sail off Mirissa to witness majestic blue whales and playful dolphins.'
},
{
  id: 'tea',
  name: 'Tea Plantation Tours',
  image: "/activity-tea-plantation.jpg",
  description: 'Walk emerald estates, meet pickers and taste Ceylon tea at its source.'
}];


export const whyChoose = [
{ icon: 'Award', title: 'Experienced Travel Experts', text: 'Over a decade crafting seamless journeys across Sri Lanka.' },
{ icon: 'Sparkles', title: 'Fully Customized Tours', text: 'Every itinerary tailored precisely to your dreams and pace.' },
{ icon: 'Compass', title: 'Trusted Local Guides', text: 'Passionate, licensed guides who know every hidden gem.' },
{ icon: 'BedDouble', title: 'Comfortable Accommodation', text: 'Handpicked hotels and boutique stays for every budget.' },
{ icon: 'BadgePercent', title: 'Affordable Prices', text: 'Premium experiences with transparent, honest pricing.' },
{ icon: 'ShieldCheck', title: 'Secure Booking Process', text: 'Encrypted payments and instant, guaranteed confirmations.' },
{ icon: 'Headphones', title: '24/7 Customer Support', text: 'Real people ready to help at any hour of your trip.' },
{ icon: 'CarFront', title: 'Safe & Reliable Transport', text: 'Modern, air-conditioned vehicles with expert drivers.' }];