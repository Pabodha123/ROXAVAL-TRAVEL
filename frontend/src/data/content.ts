
export interface Destination {
  id: string;
  name: string;
  image: string;
  description: string;
  tag: string;
}

export interface TourPackage {
  id: string;
  name: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  tag: string;
}

export interface Activity {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  name: string;
  country: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  image: string;
  preview: string;
  date: string;
  category: string;
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


export const packages: TourPackage[] = [
{
  id: 'cultural-triangle',
  name: 'Cultural Triangle Odyssey',
  image: "/pkg-cultural-triangle-odyssey.jpg",
  duration: '7 Days / 6 Nights',
  price: 1290,
  rating: 4.9,
  reviews: 214,
  description: 'Ancient cities, sacred temples and the majestic climb of Sigiriya through Sri Lanka\u2019s cultural heartland.',
  tag: 'Best Seller'
},
{
  id: 'hill-country',
  name: 'Misty Hills & Tea Trails',
  image: "/pkg-misty-hills-tea-trails.jpg",
  duration: '5 Days / 4 Nights',
  price: 980,
  rating: 4.8,
  reviews: 176,
  description: 'Ride the scenic railway through emerald tea estates, waterfalls and cool mountain villages.',
  tag: 'Scenic'
},
{
  id: 'wildlife-safari',
  name: 'Wild Sri Lanka Safari',
  image: "/60b4c194-d3e8-44d7-8a8c-b9d58a908c56.jpg",
  duration: '4 Days / 3 Nights',
  price: 860,
  rating: 4.9,
  reviews: 148,
  description: 'Track leopards and elephants across Yala and Udawalawe on immersive small-group safaris.',
  tag: 'Adventure'
},
{
  id: 'beach-escape',
  name: 'Southern Beach Escape',
  image: "/pkg-southern-beach-escape.jpg",
  duration: '6 Days / 5 Nights',
  price: 1120,
  rating: 4.7,
  reviews: 132,
  description: 'Sun-drenched beaches, whale watching in Mirissa and the historic charm of Galle Fort.',
  tag: 'Relax'
},
{
  id: 'honeymoon',
  name: 'Romantic Island Honeymoon',
  image: "/package-romantic-escape.jpg",
  duration: '8 Days / 7 Nights',
  price: 1680,
  rating: 5.0,
  reviews: 98,
  description: 'Private candle-lit dinners, luxury retreats and unforgettable sunsets crafted for two.',
  tag: 'Luxury'
},
{
  id: 'grand-tour',
  name: 'Grand Sri Lanka Discovery',
  image: "/pkg-grand-sri-lanka-discovery.jpg",
  duration: '12 Days / 11 Nights',
  price: 2350,
  rating: 4.9,
  reviews: 87,
  description: 'The complete island journey \u2014 culture, wildlife, tea country and pristine beaches in one epic tour.',
  tag: 'Signature'
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


export const reviews: Review[] = [
{
  id: 'r1',
  name: 'Tania Fischer',
  country: 'Germany',
  rating: 5,
  text: 'Our Sri Lanka 2026 trip arranged by Roxaval was flawless. Smooth co-ordination, wonderful hotels, and they customized everything to our preference. Truly unforgettable.',
  avatar: 'https://i.pravatar.cc/150?img=47'
},
{
  id: 'r2',
  name: 'James Walker',
  country: 'United Kingdom',
  rating: 5,
  text: 'From Sigiriya to Mirissa, every detail was perfectly planned. Our guide was knowledgeable and kind. The best travel experience we have ever had.',
  avatar: 'https://i.pravatar.cc/150?img=12'
},
{
  id: 'r3',
  name: 'Aisha Rahman',
  country: 'UAE',
  rating: 5,
  text: 'A dream honeymoon! The private beach dinners and luxury stays exceeded expectations. Roxaval made us feel like royalty throughout.',
  avatar: 'https://i.pravatar.cc/150?img=32'
},
{
  id: 'r4',
  name: 'Marco Rossi',
  country: 'Italy',
  rating: 5,
  text: 'Incredible wildlife safari and the scenic train ride was magical. Fantastic value and truly professional service from start to finish.',
  avatar: 'https://i.pravatar.cc/150?img=52'
}];


export const blogPosts: BlogPost[] = [
{
  id: 'b1',
  title: '10 Unmissable Experiences on Your First Sri Lanka Trip',
  image: "/b4a6270a-dd34-4113-9621-b13796ee02d1.jpg",
  preview: 'From climbing Sigiriya at dawn to whale watching in Mirissa, here are the experiences that define the island.',
  date: 'Jul 18, 2026',
  category: 'Travel Guide'
},
{
  id: 'b2',
  title: 'A Foodie\u2019s Guide to Authentic Sri Lankan Cuisine',
  image: "/dd243971-0479-413d-985b-2c217e5edc24.jpg",
  preview: 'Rice and curry, hoppers, kottu and coconut sambol \u2014 a delicious journey through the island\u2019s flavours.',
  date: 'Jul 09, 2026',
  category: 'Food & Culture'
},
{
  id: 'b3',
  title: 'Riding the Blue Train: Kandy to Ella by Rail',
  image: "/ded68c06-c3a1-4dfa-a417-e025e5868f60.jpg",
  preview: 'Everything you need to know to enjoy the world\u2019s most scenic train ride through the tea hills.',
  date: 'Jun 28, 2026',
  category: 'Adventure'
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