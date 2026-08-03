/* eslint-disable no-console */
require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const slugify = require('slugify');
const env = require('../config/env');
const { User, Admin, Destination, Activity, Hotel, TourGuide, Vehicle, TourPackage, Settings } = require('../models');

const destinationsSeed = [
  {
    name: 'Colombo', region: 'West Coast', tag: 'City',
    heroImage: '/destination-colombo.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/0/07/Colombo_Skyline_Jan_2022.jpg', 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Colombo_-_Galle_Face.jpg', 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Night_Skyline_Colombo%2C_Sri_Lanka.jpg'],
    description: 'Sri Lanka’s vibrant commercial capital — a buzzing mix of colonial architecture, glittering skyscrapers, seafront promenades and world-class dining.',
    history: 'A trading port for over 2,000 years, Colombo grew under Portuguese, Dutch and British rule into the island’s administrative and commercial hub, and remains its gateway city today.',
    whyVisit: ['Iconic Galle Face Green sunset walks', 'A melting pot of colonial and modern architecture', 'The island’s best shopping and dining scene', 'Gateway to every other Sri Lankan destination'],
    popularActivities: ['Galle Face Green stroll', 'National Museum visit', 'Pettah Market shopping', 'Harbour sunset cruise'],
    bestTimeToVisit: 'December to March', openingHours: 'Open 24 hours (city)',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free to explore; individual attractions charge separately' },
    travelTips: ['Traffic is heavy — allow extra time between stops', 'Tuk-tuks are the easiest way to get around short distances', 'Dress modestly when visiting temples in the city'],
    mapLocation: { lat: 6.9271, lng: 79.8612 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Pinnawala', region: 'Cultural Triangle', tag: 'Wildlife',
    heroImage: '/destination-pinnawala.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/c/cb/Elephant_feeding_at_Pinnawela.jpg', 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Asian_Elephants_Walking_together_01.jpg', 'https://upload.wikimedia.org/wikipedia/commons/9/97/An_Elephant_at_the_Pinnawala_Elephant_Orphanage.jpg'],
    description: 'Home to the Pinnawala Elephant Orphanage, where rescued and orphaned elephants roam, bathe in the river and are hand-raised in one of the world’s largest elephant herds.',
    history: 'Established in 1975 by Sri Lanka’s Department of Wildlife Conservation to care for orphaned wild elephants, Pinnawala has since grown into a renowned conservation and breeding centre.',
    whyVisit: ['Watch dozens of elephants bathe together in the Ma Oya river', 'See baby elephants bottle-fed up close', 'A rare, ethical elephant encounter'],
    popularActivities: ['Elephant river bathing viewing', 'Orphanage guided tour', 'Bottle-feeding baby elephants'],
    bestTimeToVisit: 'Year-round', openingHours: '8:30 AM – 5:00 PM',
    entranceFee: { amount: 20, currency: 'USD', notes: 'Foreign visitor rate; river bathing viewing included' },
    travelTips: ['Time your visit around the 10 AM or 2 PM river bathing sessions', 'Keep a safe, guided distance from the herd'],
    mapLocation: { lat: 7.3000, lng: 80.3833 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Sigiriya', region: 'Cultural Triangle', tag: 'Cultural',
    heroImage: '/destination-sigiriya.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/e/e5/Aerial_View_from_Sigiriya.jpg', 'https://upload.wikimedia.org/wikipedia/commons/2/21/Entrance_Walkway_to_Sigiriya%2C_the_lion_rock.jpg', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Climbing_Lion_rock_fortress_%2830551073942%29.jpg'],
    description: 'Climb the legendary Lion Rock fortress rising above emerald jungle, crowned with ancient frescoes and royal gardens.',
    history: 'Built by King Kashyapa in the 5th century AD as a royal citadel and fortress, Sigiriya’s summit palace, mirror wall and frescoes make it one of the best-preserved examples of ancient urban planning in Asia.',
    whyVisit: ['A UNESCO World Heritage Site and one of Asia’s best-preserved ancient cities', 'Breathtaking 360° views from the summit', 'World-famous Sigiriya frescoes'],
    popularActivities: ['Lion Rock climb', 'Water gardens walk', 'Pidurangala Rock sunrise hike', 'Village safari'],
    bestTimeToVisit: 'January to March', openingHours: '7:00 AM – 5:30 PM',
    entranceFee: { amount: 30, currency: 'USD', notes: 'Foreign visitor rate' },
    travelTips: ['Start early to beat the heat and crowds', 'Wear sturdy shoes — the final ascent is steep metal stairs', 'Not recommended for those with a fear of heights'],
    mapLocation: { lat: 7.9570, lng: 80.7603 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Dambulla', region: 'Cultural Triangle', tag: 'Cultural',
    heroImage: '/destination-dambulla.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/5/56/Buddha_Dambulla_3.jpg', 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Buddhist_Frescoes_in_Caves_of_Dambulla%2C_Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/5/58/Cavedambulla.jpg'],
    description: 'The largest and best-preserved cave temple complex in Sri Lanka, sheltering over 150 Buddha statues beneath dramatic rock overhangs.',
    history: 'Dating back to the 1st century BC, when King Valagamba sought refuge here, the cave monastery was later adorned with statues and murals by successive kings, becoming a sacred pilgrimage site for over 2,000 years.',
    whyVisit: ['A UNESCO World Heritage cave monastery', 'Over 2,000 square metres of painted murals', 'Golden Temple statue at the base'],
    popularActivities: ['Cave temple tour', 'Golden Temple visit', 'Sunset viewpoint hike'],
    bestTimeToVisit: 'January to March', openingHours: '7:00 AM – 7:00 PM',
    entranceFee: { amount: 15, currency: 'USD', notes: 'Foreign visitor rate' },
    travelTips: ['Cover shoulders and knees, and remove shoes before entering', 'Bring socks — the stone floors get very hot'],
    mapLocation: { lat: 7.8567, lng: 80.6493 }, status: 'published',
  },
  {
    name: 'Anuradhapura', region: 'Cultural Triangle', tag: 'Cultural',
    heroImage: '/destination-anuradhapura.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/c/c4/Anuradhapura_01.jpg', 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Anuradhapura_02.jpg', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Anuradhapura_2019.jpg'],
    description: 'Sri Lanka’s first ancient capital, a sprawling sacred city of towering dagobas, monastery ruins and the world’s oldest recorded tree.',
    history: 'Founded in the 4th century BC, Anuradhapura was the island’s political and religious centre for over 1,300 years, and remains one of the most important Buddhist pilgrimage sites in the world.',
    whyVisit: ['Home to the sacred Jaya Sri Maha Bodhi tree', 'Colossal ancient dagobas rivalling the pyramids in scale', 'A living UNESCO World Heritage sacred city'],
    popularActivities: ['Sacred city bicycle tour', 'Jaya Sri Maha Bodhi visit', 'Ruwanwelisaya stupa tour'],
    bestTimeToVisit: 'May to September', openingHours: '6:00 AM – 6:00 PM',
    entranceFee: { amount: 25, currency: 'USD', notes: 'Foreign visitor rate (single ticket covers the sacred city)' },
    travelTips: ['The sacred city is huge — hire a bike or tuk-tuk to get around', 'Dress modestly and remove footwear at stupas'],
    mapLocation: { lat: 8.3114, lng: 80.4037 }, status: 'published',
  },
  {
    name: 'Polonnaruwa', region: 'Cultural Triangle', tag: 'Cultural',
    heroImage: '/destination-polonnaruwa.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/1/16/Ancient_City_of_Polonnaruwa%2C_Sri_Lanka_%281%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/8/87/Ancient_City_of_Polonnaruwa%2C_Sri_Lanka_%282%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/5/51/Atadage_Polonnaruwa.jpg'],
    description: 'Sri Lanka’s medieval capital, an exceptionally well-preserved complex of royal palaces, temples and giant rock-carved Buddha statues.',
    history: 'Polonnaruwa succeeded Anuradhapura as the island’s capital in the 11th century, reaching its peak under King Parakramabahu I, whose irrigation works and monuments still stand today.',
    whyVisit: ['The best-preserved ancient city in Sri Lanka', 'The stunning Gal Vihara rock-cut Buddha statues', 'Compact enough to explore in a single day'],
    popularActivities: ['Ancient city cycling tour', 'Gal Vihara statues visit', 'Parakrama Samudra lake walk'],
    bestTimeToVisit: 'May to September', openingHours: '7:00 AM – 6:00 PM',
    entranceFee: { amount: 25, currency: 'USD', notes: 'Foreign visitor rate' },
    travelTips: ['Cycling is the best way to cover the wide, flat site', 'Visit early morning to avoid the midday heat'],
    mapLocation: { lat: 7.9403, lng: 81.0188 }, status: 'published',
  },
  {
    name: 'Minneriya', region: 'Wildlife', tag: 'Nature',
    heroImage: '/destination-minneriya.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/e/e5/Minneriya_National_Park%2C_Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/6/62/Dusk_at_Minneriya.jpg', 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Minneriya_Lake_%287568702526%29.jpg'],
    description: 'A wetland national park famed for "The Gathering" — the largest seasonal congregation of wild Asian elephants anywhere in the world.',
    history: 'Built around an ancient reservoir constructed by King Mahasena in the 3rd century, Minneriya’s grasslands and lake have drawn elephant herds for centuries, later protected as a national park in 1997.',
    whyVisit: ['Witness hundreds of wild elephants gathering at the lake', 'Rich birdlife and diverse wetland ecosystems', 'A quieter, less crowded alternative to Yala'],
    popularActivities: ['Jeep safari', 'The Gathering elephant viewing (Aug–Sep)', 'Birdwatching'],
    bestTimeToVisit: 'August to September (The Gathering)', openingHours: '6:00 AM – 6:00 PM',
    entranceFee: { amount: 15, currency: 'USD', notes: 'Plus jeep hire, arranged locally' },
    travelTips: ['Book a jeep safari through a licensed operator in advance', 'Bring binoculars for the best elephant and bird viewing'],
    mapLocation: { lat: 8.0146, lng: 80.8886 }, status: 'published',
  },
  {
    name: 'Kandy', region: 'Hill Country', tag: 'Cultural',
    heroImage: '/destination-kandy.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/1/15/The_Kandy_Lake_at_dawn.jpg', 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Kandy_Lake-Sri_Lanka_%285%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Daladamaligawa.jpg'],
    description: 'The hill capital wrapped around a serene lake, home to the sacred Temple of the Tooth and lush botanical gardens.',
    history: 'The last capital of the Sinhalese kings until British annexation in 1815, Kandy remained the seat of Buddhist religious life and today safeguards the country’s most sacred relic, the tooth of the Buddha.',
    whyVisit: ['Home to the sacred Temple of the Tooth Relic', 'A UNESCO World Heritage city ringed by hills', 'Royal Botanical Gardens at nearby Peradeniya'],
    popularActivities: ['Temple of the Tooth visit', 'Kandy Lake walk', 'Cultural dance show', 'Royal Botanical Gardens tour'],
    bestTimeToVisit: 'January to April', openingHours: '5:30 AM – 8:00 PM (Temple of the Tooth)',
    entranceFee: { amount: 10, currency: 'USD', notes: 'Temple of the Tooth, foreign visitor rate' },
    travelTips: ['Dress modestly for temple visits — shoulders and knees covered', 'Catch the evening drumming ceremony at the temple'],
    mapLocation: { lat: 7.2906, lng: 80.6337 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Nuwara Eliya', region: 'Tea Country', tag: 'Hill Country',
    heroImage: '/destination-nuwara-eliya.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/b/b3/Sri_Lanka%2C_Tea_plantations%2C_Nuwara_Eliya%2C_Picking_tea_leaves.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/1a/By_the_Gregory_Lake.jpg', 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Tea-plantation_Nuwara_Eliya-2567.jpg'],
    description: 'Little England amid endless tea plantations, colonial charm and cool, fragrant mountain air.',
    history: 'Developed by British colonists in the 19th century as a hill-station retreat from the tropical heat, Nuwara Eliya retains its Tudor-style cottages, manicured gardens and racecourse to this day.',
    whyVisit: ['Cool, crisp climate unlike anywhere else on the island', 'Endless emerald tea estates', 'Colonial-era architecture and gardens'],
    popularActivities: ['Tea factory tour and tasting', 'Gregory Lake boating', 'Horton Plains day trip', 'Victoria Park stroll'],
    bestTimeToVisit: 'March to May', openingHours: 'Open 24 hours (town)',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free; tea factory tours charge separately' },
    travelTips: ['Pack warm layers — nights can drop below 10°C', 'Book tea factory tours in the morning for fresher picking activity'],
    mapLocation: { lat: 6.9497, lng: 80.7891 }, status: 'published',
  },
  {
    name: 'Ella', region: 'Hill Country', tag: 'Hill Country',
    heroImage: '/destination-ella.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/a/a7/SL_Ella_asv2020-01_img08_Little_Adams_Peak.jpg', 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Ella_Gap_%28Valley%29%2C_Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/5/55/Ella_rock_sri_lanka.jpg'],
    description: 'A misty mountain village famed for the Nine Arch Bridge, tea trails and sweeping valley sunrises.',
    history: 'Once a quiet colonial-era tea-estate outpost, Ella grew into one of Sri Lanka’s most beloved hill-country retreats thanks to the iconic railway that winds through its valleys.',
    whyVisit: ['The iconic Nine Arch Bridge', 'Panoramic hikes up Little Adam’s Peak and Ella Rock', 'The world’s most scenic train ride passes through'],
    popularActivities: ['Nine Arch Bridge visit', 'Little Adam’s Peak hike', 'Ella Rock trek', 'Scenic train ride to/from Kandy'],
    bestTimeToVisit: 'December to March', openingHours: 'Open 24 hours',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free; open-air village and trails' },
    travelTips: ['Start hikes early to avoid cloud cover on the peaks', 'Buy train tickets days in advance in high season'],
    mapLocation: { lat: 6.8667, lng: 81.0466 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Yala', region: 'Wildlife', tag: 'Wildlife',
    heroImage: '/destination-yala.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/3/32/Sri_Lankan_Leopard_-_Yala_National_Park.jpg', 'https://upload.wikimedia.org/wikipedia/commons/3/33/A_road_in_Yala_National_Park_2023-03-11-1.jpg', 'https://upload.wikimedia.org/wikipedia/commons/8/87/Beauty_within_Yala_National_park_04.jpg'],
    description: 'The island’s wildest frontier, where leopards, elephants and painted savannas make every safari unforgettable.',
    history: 'Designated a wildlife sanctuary in 1900 and a national park in 1938, Yala is Sri Lanka’s oldest and most visited park, renowned for having one of the highest densities of leopards anywhere on Earth.',
    whyVisit: ['Highest density of leopards in the world', 'Diverse ecosystems from scrubland to lagoons', 'Guided by experienced trackers'],
    popularActivities: ['Leopard safari', 'Elephant spotting', 'Birdwatching', 'Ancient ruins within the park'],
    bestTimeToVisit: 'February to July', openingHours: '6:00 AM – 6:00 PM',
    entranceFee: { amount: 25, currency: 'USD', notes: 'Plus jeep hire, arranged locally' },
    travelTips: ['Book a licensed jeep safari operator in advance', 'Early morning and late afternoon safaris have the best sightings'],
    mapLocation: { lat: 6.3735, lng: 81.5273 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Mirissa', region: 'South Coast', tag: 'Beach',
    heroImage: '/destination-mirissa.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/5/54/Whale_watching_in_Mirissa.jpg', 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Parrot_Rock_Bridge_in_Mirissa_Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Mirissa%2C_whale_watching%2C_blue_whale_%286917912897%29.jpg'],
    description: 'A palm-fringed crescent bay for whale watching, golden sunsets and laid-back tropical bliss.',
    history: 'Once a sleepy fishing village, Mirissa rose to prominence over the past two decades as one of the world’s best spots to see blue whales, alongside its growing reputation as a boutique beach escape.',
    whyVisit: ['One of the best places on Earth to see blue whales', 'Postcard-perfect crescent beach', 'Relaxed, boutique beach-town vibe'],
    popularActivities: ['Whale and dolphin watching cruise', 'Parrot Rock sunset viewpoint', 'Surfing', 'Beach hammock lounging'],
    bestTimeToVisit: 'November to April', openingHours: 'Open 24 hours',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free beach; whale watching tours charge separately' },
    travelTips: ['Take motion-sickness tablets before whale watching trips', 'Peak whale season books up fast — reserve boat tours ahead'],
    mapLocation: { lat: 5.9483, lng: 80.4589 }, status: 'published',
  },
  {
    name: 'Bentota', region: 'West Coast', tag: 'Beach',
    heroImage: '/destination-bentota.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/b/b0/Bentota_Beach_-_panoramio_%281%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/4/41/Sri_Lanka%2C_Bentota%2C_beach_%281%29.JPG', 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Bentota_beach_in_evening.jpg'],
    description: 'Golden beaches, river safaris and luxury resorts make this the perfect gateway to the west coast.',
    history: 'One of Sri Lanka’s first purpose-built resort destinations, developed from the 1960s onward around the meeting point of the Bentota River and the Indian Ocean.',
    whyVisit: ['Wide, golden sands and calm swimming waters', 'Where the Bentota River meets the sea', 'A hub for water sports and luxury resorts'],
    popularActivities: ['Bentota River safari', 'Jet skiing & water sports', 'Turtle hatchery visit', 'Ayurveda spa treatments'],
    bestTimeToVisit: 'November to April', openingHours: 'Open 24 hours',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free beach; activities charge separately' },
    travelTips: ['Negotiate water-sport prices before booking', 'Visit the turtle hatchery in the early evening for release viewing'],
    mapLocation: { lat: 6.4260, lng: 79.9955 }, status: 'published',
  },
  {
    name: 'Galle', region: 'South Coast', tag: 'Cultural',
    heroImage: '/destination-galle.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/8/82/Fort_galle_2017-10-28_%2813%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/1/17/Festung_Galle_%2825608031820%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Galle_Lighthouse-1.JPG'],
    description: 'A UNESCO fort city of cobbled lanes, colonial ramparts and ocean sunsets steeped in centuries of history.',
    history: 'Fortified first by the Portuguese and then extensively rebuilt by the Dutch in the 17th century, Galle Fort remains the best-preserved example of a European fortified city in South Asia.',
    whyVisit: ['A UNESCO World Heritage fortified old town', 'Sunset walks along the ancient ramparts', 'Boutique cafes, galleries and colonial architecture'],
    popularActivities: ['Galle Fort rampart walk', 'Galle Lighthouse visit', 'Boutique shopping & cafes', 'Snorkeling at nearby reefs'],
    bestTimeToVisit: 'December to April', openingHours: 'Open 24 hours (fort grounds)',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free to explore the fort' },
    travelTips: ['Wander without a plan — the fort rewards slow exploring', 'Best light for photos is at sunset on the ramparts'],
    mapLocation: { lat: 6.0300, lng: 80.2170 }, status: 'published', isFeatured: true,
  },
  {
    name: 'Trincomalee', region: 'East', tag: 'Beach',
    heroImage: '/destination-trincomalee.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/4/47/Trincomalee_beach.jpg', 'https://upload.wikimedia.org/wikipedia/commons/8/88/Uppveli_Beach_in_Trincomalee%2C_Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Marble_beach_Trincomalee.jpg'],
    description: 'A natural deep-water harbour city on the east coast, famed for pristine beaches, ancient temples and world-class diving.',
    history: 'Home to one of the world’s finest natural harbours, Trincomalee has been fought over by Portuguese, Dutch, French and British colonial powers for centuries, and remains crowned by the clifftop Koneswaram Temple.',
    whyVisit: ['Some of the clearest waters and best diving in Sri Lanka', 'The dramatic clifftop Koneswaram Temple', 'Quieter, less-crowded beaches than the south coast'],
    popularActivities: ['Koneswaram Temple visit', 'Scuba diving & snorkeling', 'Pigeon Island boat trip', 'Whale watching (in season)'],
    bestTimeToVisit: 'May to September', openingHours: 'Open 24 hours (beaches)',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free beaches; Pigeon Island park fee applies separately' },
    travelTips: ['East coast season runs opposite the south/west coasts (May–Sep)', 'Book Pigeon Island boat trips early in the day for calmer seas'],
    mapLocation: { lat: 8.5874, lng: 81.2152 }, status: 'published',
  },
  {
    name: 'Arugam Bay', region: 'East', tag: 'Adventure',
    heroImage: '/destination-arugam-bay.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/0/0c/Arugam_bay_beach.jpg', 'https://upload.wikimedia.org/wikipedia/commons/0/03/Arugam_Bay%2C_Sri_Lanka_-_panoramio.jpg', 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Whiskey_Point_2.jpg'],
    description: 'Sri Lanka’s premier surf town, a laid-back bay ringed by world-class breaks, lagoons and a thriving backpacker scene.',
    history: 'Discovered by traveling surfers in the 1970s for its perfect right-hand point break, Arugam Bay has grown into one of Asia’s top surf destinations while keeping its relaxed, bohemian character.',
    whyVisit: ['One of the world’s top surf breaks, Main Point', 'A laid-back, bohemian beach-town atmosphere', 'Nearby lagoons and wildlife-rich national parks'],
    popularActivities: ['Surfing', 'Lagoon safari', 'Yoga retreats', 'Kumana National Park day trip'],
    bestTimeToVisit: 'May to September', openingHours: 'Open 24 hours',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free; surf lessons and safaris charge separately' },
    travelTips: ['Surf season peaks June–August with the most consistent swell', 'Book accommodation ahead in peak season — it fills up fast'],
    mapLocation: { lat: 6.8400, lng: 81.8360 }, status: 'published',
  },
  {
    name: 'Jaffna', region: 'North', tag: 'Cultural',
    heroImage: '/destination-jaffna.jpg',
    gallery: ['https://upload.wikimedia.org/wikipedia/commons/3/3b/Kandaswamy_koil-2-nallur-jaffna-Sri_Lanka.jpg', 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Jaffna_Library_%28Jaffna%2C_Sri_Lanka%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/b/be/Jaffna_sea.jpg'],
    description: 'The cultural heart of Sri Lanka’s Tamil north — ornate Hindu temples, colonial forts and a distinct cuisine and heritage found nowhere else on the island.',
    history: 'Capital of the historic Jaffna Kingdom for centuries, the peninsula’s Tamil, Portuguese, Dutch and British layers of history are visible in its temples, the rebuilt Jaffna Library and the Dutch-era fort.',
    whyVisit: ['The vividly colourful Nallur Kandaswamy Temple', 'A distinct culture, cuisine and language from the rest of the island', 'The rebuilt Jaffna Library, a symbol of resilience'],
    popularActivities: ['Nallur Kandaswamy Temple visit', 'Jaffna Fort exploration', 'Jaffna Library visit', 'Island-hopping to Delft & Nainativu'],
    bestTimeToVisit: 'May to September', openingHours: '6:00 AM – 8:00 PM (Nallur Temple)',
    entranceFee: { amount: 0, currency: 'USD', notes: 'Free; modest dress required at temples' },
    travelTips: ['Dress conservatively when visiting Hindu temples', 'Try Jaffna’s distinct crab curry and palmyrah-based dishes'],
    mapLocation: { lat: 9.6615, lng: 80.0255 }, status: 'published',
  },
];

// 2–3 geographically-sensible nearby destinations per entry, resolved to
// ObjectIds by name after the main upsert loop below (destinations don't
// exist yet while this literal is being defined).
const nearbyDestinationsByName = {
  'Colombo': ['Pinnawala', 'Bentota'],
  'Pinnawala': ['Kandy', 'Colombo'],
  'Sigiriya': ['Dambulla', 'Polonnaruwa', 'Minneriya'],
  'Dambulla': ['Sigiriya', 'Kandy'],
  'Anuradhapura': ['Polonnaruwa', 'Sigiriya'],
  'Polonnaruwa': ['Anuradhapura', 'Sigiriya', 'Minneriya'],
  'Minneriya': ['Sigiriya', 'Polonnaruwa'],
  'Kandy': ['Nuwara Eliya', 'Dambulla', 'Pinnawala'],
  'Nuwara Eliya': ['Kandy', 'Ella'],
  'Ella': ['Nuwara Eliya', 'Yala'],
  'Yala': ['Ella', 'Mirissa'],
  'Mirissa': ['Galle', 'Bentota', 'Yala'],
  'Bentota': ['Galle', 'Colombo'],
  'Galle': ['Mirissa', 'Bentota'],
  'Trincomalee': ['Minneriya', 'Polonnaruwa'],
  'Arugam Bay': ['Yala'],
  'Jaffna': ['Anuradhapura'],
};

const hotelsSeed = [
  { name: 'Water Garden Sigiriya', destination: 'Sigiriya', category: 'Luxury', starRating: 5, address: 'Inamaluwa, Sigiriya', description: 'A lush lagoon resort in the shadow of the Lion Rock, with private garden villas and open-air dining.', images: ['/hotel-water-garden-sigiriya.jpg'], amenities: ['Pool', 'Spa', 'Free WiFi', 'Restaurant'], roomTypes: [{ name: 'Garden Villa', maxOccupancy: 2, pricePerNight: 180, amenities: ['Private terrace', 'Air conditioning'] }] },
  { name: 'Kandy Lake Residence', destination: 'Kandy', category: 'Deluxe', starRating: 4, address: 'Sangaraja Mawatha, Kandy', description: 'Boutique lakeside stay with sweeping views over Kandy Lake and the Temple of the Tooth.', images: ['/hotel-kandy-lake-residence.jpg'], amenities: ['Lake view', 'Free WiFi', 'Restaurant'], roomTypes: [{ name: 'Lake View Room', maxOccupancy: 2, pricePerNight: 110, amenities: ['Balcony', 'Air conditioning'] }] },
  { name: 'Ella Flower Garden Resort', destination: 'Ella', category: 'Boutique', starRating: 4, address: 'Passara Road, Ella', description: 'A hillside retreat surrounded by tea gardens with panoramic views of Ella Gap.', images: ['/hotel-ella-flower-garden.jpg'], amenities: ['Mountain view', 'Pool', 'Free WiFi'], roomTypes: [{ name: 'Valley View Cottage', maxOccupancy: 2, pricePerNight: 95, amenities: ['Private balcony'] }] },
  { name: 'Cinnamon Wild Yala', destination: 'Yala', category: 'Resort', starRating: 5, address: 'Palatupana, Yala', description: 'Chalets bordering Yala National Park, built for waking up to the sound of the wild.', images: ['/hotel-cinnamon-wild-yala.jpg'], amenities: ['Pool', 'Safari desk', 'Restaurant'], roomTypes: [{ name: 'Chalet Room', maxOccupancy: 2, pricePerNight: 160, amenities: ['Garden view', 'Air conditioning'] }] },
  { name: 'Jetwing Lighthouse Galle', destination: 'Galle', category: 'Luxury', starRating: 5, address: 'Dadella, Galle', description: 'A clifftop icon overlooking the Indian Ocean, designed by renowned architect Geoffrey Bawa.', images: ['/hotel-jetwing-lighthouse-galle.jpg'], amenities: ['Ocean view', 'Pool', 'Spa'], roomTypes: [{ name: 'Ocean View Room', maxOccupancy: 2, pricePerNight: 210, amenities: ['Sea view', 'Minibar'] }] },
  { name: 'Mirissa Beach Villas', destination: 'Mirissa', category: 'Resort', starRating: 4, address: 'Beach Road, Mirissa', description: 'Palm-shaded villas steps from the sand, close to Mirissa’s whale-watching harbour.', images: ['/hotel-mirissa-beach-villas.jpg'], amenities: ['Beachfront', 'Pool', 'Restaurant'], roomTypes: [{ name: 'Beachfront Villa', maxOccupancy: 2, pricePerNight: 140, amenities: ['Sea view', 'Outdoor shower'] }] },
  { name: 'Taru Villas Bentota', destination: 'Bentota', category: 'Boutique', starRating: 4, address: 'River Avenue, Bentota', description: 'A riverside boutique villa blending colonial charm with tropical garden courtyards.', images: ['/hotel-taru-villas-bentota.jpg'], amenities: ['River view', 'Pool', 'Free WiFi'], roomTypes: [{ name: 'Garden Room', maxOccupancy: 2, pricePerNight: 105, amenities: ['River view'] }] },
];

const tourGuidesSeed = [
  { name: 'Nimal Perera', languages: ['English', 'Sinhala', 'German'], specialties: ['Cultural Triangle', 'Wildlife Safaris'], yearsExperience: 12, bio: 'A licensed national guide specializing in the ancient cities and national parks, fluent in German for European travelers.', contactPhone: '+94 77 111 2222', pricePerDay: 45, rating: 4.8 },
  { name: 'Chamari Silva', languages: ['English', 'Sinhala', 'French'], specialties: ['Hill Country', 'Tea Trails'], yearsExperience: 8, bio: 'Grew up in Nuwara Eliya\'s tea estates and specializes in scenic hill country and train journeys.', contactPhone: '+94 77 222 3333', pricePerDay: 40, rating: 4.9 },
  { name: 'Ruwan Fernando', languages: ['English', 'Sinhala', 'Tamil'], specialties: ['South Coast', 'Whale Watching'], yearsExperience: 15, bio: 'A veteran coastal guide with deep knowledge of Galle Fort history and marine wildlife.', contactPhone: '+94 77 333 4444', pricePerDay: 42, rating: 4.7 },
];

const vehiclesSeed = [
  { name: 'Toyota Prius Hybrid', type: 'Car', capacity: 3, driverIncluded: true, features: ['Air conditioning', 'WiFi'], pricePerDay: 55 },
  { name: 'Toyota KDH Van', type: 'Van', capacity: 8, driverIncluded: true, features: ['Air conditioning', 'Extra luggage space'], pricePerDay: 85 },
  { name: 'Toyota Land Cruiser', type: 'SUV', capacity: 5, driverIncluded: true, features: ['Air conditioning', '4x4 off-road capable'], pricePerDay: 110 },
  { name: 'Rosa Minibus', type: 'Minibus', capacity: 20, driverIncluded: true, features: ['Air conditioning', 'PA system'], pricePerDay: 150 },
];

const activitiesSeed = [
  {
    name: 'Wildlife Safari', category: 'Wildlife', image: '/activity-wildlife-safari.jpg',
    gallery: ['/activity-wildlife-safari.jpg'],
    description: 'Spot leopards, elephants and exotic birds in Yala and Udawalawe national parks.',
    location: 'Yala National Park', bestSeason: 'Feb – Jul', durationHours: 6, priceFrom: 65, difficultyLevel: 'Moderate',
    destinations: ['Yala'], mapLocation: { lat: 6.3735, lng: 81.5273 },
    highlights: ['Highest density of leopards in the world', 'Diverse ecosystems from scrubland to lagoons', 'Guided by experienced trackers'],
    thingsIncluded: ['4x4 jeep with driver-guide', 'Park entrance fees', 'Bottled water'],
    thingsToBring: ['Sunscreen & hat', 'Binoculars', 'Camera with zoom lens'],
    isFeatured: true, status: 'published',
  },
  {
    name: 'Scenic Train Journey', category: 'Scenic', image: '/activity-scenic-train.jpg',
    gallery: ['/activity-scenic-train.jpg'],
    description: 'Ride the world’s most beautiful railway through misty tea-covered hills.',
    location: 'Kandy to Ella Railway', bestSeason: 'Dec – Mar', durationHours: 7, priceFrom: 25, difficultyLevel: 'Easy',
    destinations: ['Kandy', 'Ella'], mapLocation: { lat: 6.8667, lng: 81.0466 },
    highlights: ['The world’s most scenic railway', 'Waterfalls, tea estates and misty mountains', 'Crosses the iconic Nine Arch Bridge'],
    thingsIncluded: ['Reserved observation-class seat'],
    thingsToBring: ['Light jacket for cool hill air', 'Camera'],
    isFeatured: true, status: 'published',
  },
  {
    name: 'Whale Watching', category: 'Water Sports', image: '/activity-whale-watching.jpg',
    gallery: ['/activity-whale-watching.jpg'],
    description: 'Sail off Mirissa to witness majestic blue whales and playful dolphins.',
    location: 'Mirissa Harbour', bestSeason: 'Nov – Apr', durationHours: 4, priceFrom: 45, difficultyLevel: 'Easy',
    destinations: ['Mirissa'], mapLocation: { lat: 5.9483, lng: 80.4589 },
    highlights: ['Spot blue whales, the largest animal on Earth', 'Playful dolphin pods often join the boat', 'Sunrise departure for calmer seas'],
    thingsIncluded: ['Boat charter & life jackets', 'Light breakfast', 'Marine biologist guide'],
    thingsToBring: ['Motion sickness tablets', 'Sunscreen', 'Warm layer for the morning breeze'],
    status: 'published',
  },
  {
    name: 'Tea Plantation Tours', category: 'Culture', image: '/activity-tea-plantation.jpg',
    gallery: ['/activity-tea-plantation.jpg'],
    description: 'Walk emerald estates, meet pickers and taste Ceylon tea at its source.',
    location: 'Nuwara Eliya', bestSeason: 'Year-round', durationHours: 3, priceFrom: 15, difficultyLevel: 'Easy',
    destinations: ['Nuwara Eliya'], mapLocation: { lat: 6.9497, lng: 80.7891 },
    highlights: ['Walk through emerald tea estates', 'Meet tea pickers and learn the harvest process', 'Ceylon tea tasting session'],
    thingsIncluded: ['Factory tour & tea tasting', 'Local guide'],
    thingsToBring: ['Comfortable walking shoes'],
    status: 'published',
  },
  {
    name: 'Sigiriya Rock Climb', category: 'Adventure', image: '/activity-sigiriya-climb.jpg',
    gallery: ['/activity-sigiriya-climb.jpg'],
    description: 'Climb the 5th-century Lion Rock fortress and its famous frescoes.',
    location: 'Sigiriya', bestSeason: 'Jan – Mar', durationHours: 4, priceFrom: 35, difficultyLevel: 'Hard',
    destinations: ['Sigiriya'], mapLocation: { lat: 7.9570, lng: 80.7603 },
    highlights: ['Climb the 5th-century Lion Rock fortress', 'See the famous Sigiriya frescoes', 'Panoramic views from the summit'],
    thingsIncluded: ['Entrance ticket', 'Licensed guide'],
    thingsToBring: ['Sturdy shoes', 'Water bottle', 'Hat'],
    isFeatured: true, status: 'published',
  },
  {
    name: 'Temple of the Tooth Tour', category: 'Culture', image: '/activity-temple-of-the-tooth.jpg',
    gallery: ['/activity-temple-of-the-tooth.jpg'],
    description: 'Visit Sri Lanka’s most sacred Buddhist temple and witness the evening ceremony.',
    location: 'Kandy', bestSeason: 'Year-round', durationHours: 2, priceFrom: 10, difficultyLevel: 'Easy',
    destinations: ['Kandy'], mapLocation: { lat: 7.2906, lng: 80.6337 },
    highlights: ['Sri Lanka’s most sacred Buddhist temple', 'Witness the evening puja ceremony', 'Explore the Royal Botanical Gardens nearby'],
    thingsIncluded: ['Entrance fee', 'Local guide'],
    thingsToBring: ['Modest clothing covering shoulders & knees'],
    status: 'published',
  },
  {
    name: 'Galle Fort Walking Tour', category: 'Culture', image: '/activity-galle-fort-walk.jpg',
    gallery: ['/activity-galle-fort-walk.jpg'],
    description: 'Wander cobbled lanes of a UNESCO World Heritage fort city by the ocean.',
    location: 'Galle Fort', bestSeason: 'Dec – Apr', durationHours: 3, priceFrom: 20, difficultyLevel: 'Easy',
    destinations: ['Galle'], mapLocation: { lat: 6.0535, lng: 80.2210 },
    highlights: ['Cobbled lanes of a UNESCO World Heritage fort', 'Colonial-era architecture and boutique shops', 'Sunset views from the ramparts'],
    thingsIncluded: ['Walking guide', 'Bottled water'],
    thingsToBring: ['Comfortable shoes', 'Sun hat'],
    status: 'published',
  },
  {
    name: 'Little Adam’s Peak Hike', category: 'Adventure', image: '/activity-little-adams-peak.jpg',
    gallery: ['/activity-little-adams-peak.jpg'],
    description: 'A gentle hike with sweeping views over Ella Gap and the surrounding tea hills.',
    location: 'Ella', bestSeason: 'Jan – Mar', durationHours: 3, priceFrom: 12, difficultyLevel: 'Moderate',
    destinations: ['Ella'], mapLocation: { lat: 6.8700, lng: 81.0530 },
    highlights: ['Sweeping views over Ella Gap', 'Gentle hike suited to most fitness levels', 'Golden-hour photography spot'],
    thingsIncluded: ['Local guide (optional)'],
    thingsToBring: ['Trainers or hiking shoes', 'Water', 'Sunscreen'],
    status: 'published',
  },
  {
    name: 'River Safari & Turtle Hatchery', category: 'Nature', image: '/activity-river-safari-turtle.jpg',
    gallery: ['/activity-river-safari-turtle.jpg'],
    description: 'Cruise the Bentota River mangroves and visit a sea turtle hatchery.',
    location: 'Bentota River', bestSeason: 'Nov – Apr', durationHours: 3, priceFrom: 30, difficultyLevel: 'Easy',
    destinations: ['Bentota'], mapLocation: { lat: 6.4260, lng: 79.9955 },
    highlights: ['Cruise the Bentota River mangroves', 'Spot monitor lizards, birds and crocodiles', 'Visit a sea turtle hatchery'],
    thingsIncluded: ['Boat ride', 'Hatchery entrance fee'],
    thingsToBring: ['Insect repellent', 'Camera'],
    status: 'published',
  },
  {
    name: 'Udawalawe Elephant Safari', category: 'Wildlife', image: '/activity-udawalawe-safari.jpg',
    gallery: ['/activity-udawalawe-safari.jpg'],
    description: 'Home to over 500 wild elephants roaming open grasslands.',
    location: 'Udawalawe National Park', bestSeason: 'May – Sep', durationHours: 5, priceFrom: 55, difficultyLevel: 'Moderate',
    destinations: [], mapLocation: { lat: 6.4408, lng: 80.8985 },
    highlights: ['Home to over 500 wild elephants', 'Visit the Elephant Transit Home', 'Open plains ideal for sightings'],
    thingsIncluded: ['4x4 jeep & driver-guide', 'Park entrance fees'],
    thingsToBring: ['Binoculars', 'Hat & sunscreen'],
    status: 'published',
  },
];

function buildPackagesSeed(destMap, activityMap, hotelMap) {
  const dest = (names) => names.map((n) => destMap[n]).filter(Boolean);
  const acts = (names) => names.map((n) => activityMap[n]).filter(Boolean);
  const hotel = (name) => hotelMap[name];

  return [
    {
      name: 'Romantic Escape',
      category: 'Honeymoon',
      tourType: 'Private',
      heroImage: '/package-romantic-escape.jpg',
      gallery: ['/package-romantic-escape.jpg'],
      destinations: dest(['Bentota', 'Galle', 'Mirissa']),
      activities: acts(['River Safari & Turtle Hatchery', 'Galle Fort Walking Tour', 'Whale Watching']),
      hotels: [hotel('Taru Villas Bentota'), hotel('Jetwing Lighthouse Galle'), hotel('Mirissa Beach Villas')].filter(Boolean),
      durationDays: 6,
      durationNights: 5,
      itinerary: [
        { dayNumber: 1, title: 'Arrival & Bentota Riverside', description: 'Arrive in Colombo and transfer to Bentota. Settle into your riverside villa and enjoy a welcome dinner.', destinations: dest(['Bentota']), hotel: hotel('Taru Villas Bentota'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Bentota River Safari', description: 'Cruise the mangroves, spot wildlife and visit a sea turtle hatchery before an afternoon by the pool.', destinations: dest(['Bentota']), activities: acts(['River Safari & Turtle Hatchery']), hotel: hotel('Taru Villas Bentota'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'Onward to Galle Fort', description: 'Drive south to the UNESCO-listed Galle Fort for a guided sunset walking tour of the ramparts.', destinations: dest(['Galle']), activities: acts(['Galle Fort Walking Tour']), hotel: hotel('Jetwing Lighthouse Galle'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Private Beach Dinner', description: 'A free day to relax by the ocean, followed by a private candle-lit dinner on the beach at sunset.', destinations: dest(['Galle']), hotel: hotel('Jetwing Lighthouse Galle'), meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 5, title: 'Mirissa Whale Watching', description: 'Transfer to Mirissa for a sunrise whale-watching cruise, then unwind at your beachfront villa.', destinations: dest(['Mirissa']), activities: acts(['Whale Watching']), hotel: hotel('Mirissa Beach Villas'), meals: ['Breakfast'] },
        { dayNumber: 6, title: 'Departure', description: 'Enjoy a final beach breakfast before transferring back to Colombo for your departure flight.', destinations: dest(['Mirissa']), meals: ['Breakfast'] },
      ],
      includedServices: ['Private air-conditioned vehicle & driver', 'Daily breakfast', 'Private candle-lit dinner', 'All activities listed', 'Airport transfers'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Personal expenses'],
      description: 'Private candle-lit dinners, luxury retreats and unforgettable sunsets crafted for two along Sri Lanka’s southern coast.',
      highlights: ['Private beachfront candle-lit dinner', 'Sunrise whale watching in Mirissa', 'Boutique riverside and clifftop stays', 'Sunset walking tour of Galle Fort'],
      price: 1450,
      discountPrice: 1290,
      currency: 'USD',
      minTravelers: 2,
      maxTravelers: 2,
      rating: 4.9,
      reviewsCount: 62,
      status: 'published',
      isFeatured: true,
    },
    {
      name: 'Emerald Odyssey',
      category: 'Scenic',
      tourType: 'Group',
      heroImage: '/pkg-misty-hills-tea-trails.jpg',
      gallery: ['/pkg-misty-hills-tea-trails.jpg'],
      destinations: dest(['Kandy', 'Nuwara Eliya', 'Ella']),
      activities: acts(['Temple of the Tooth Tour', 'Tea Plantation Tours', 'Scenic Train Journey', 'Little Adam’s Peak Hike']),
      hotels: [hotel('Kandy Lake Residence'), hotel('Ella Flower Garden Resort')].filter(Boolean),
      durationDays: 5,
      durationNights: 4,
      itinerary: [
        { dayNumber: 1, title: 'Arrival in Kandy', description: 'Transfer to Kandy and visit the sacred Temple of the Tooth in time for the evening ceremony.', destinations: dest(['Kandy']), activities: acts(['Temple of the Tooth Tour']), hotel: hotel('Kandy Lake Residence'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Kandy to Nuwara Eliya', description: 'Drive into tea country, touring a working plantation and factory along the way.', destinations: dest(['Nuwara Eliya']), activities: acts(['Tea Plantation Tours']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'The Blue Train to Ella', description: 'Board the famous scenic railway through misty hills and waterfalls, arriving in Ella by afternoon.', destinations: dest(['Ella']), activities: acts(['Scenic Train Journey']), hotel: hotel('Ella Flower Garden Resort'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Little Adam’s Peak', description: 'An easy sunrise hike for sweeping views over Ella Gap, followed by a free afternoon in the village.', destinations: dest(['Ella']), activities: acts(['Little Adam’s Peak Hike']), hotel: hotel('Ella Flower Garden Resort'), meals: ['Breakfast'] },
        { dayNumber: 5, title: 'Departure', description: 'Final breakfast among the tea hills before transferring back toward Colombo.', destinations: dest(['Ella']), meals: ['Breakfast'] },
      ],
      includedServices: ['Air-conditioned group transport', 'Daily breakfast', 'Reserved train tickets', 'English-speaking guide', 'All activities listed'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Lunch & dinner unless stated'],
      description: 'Ride the scenic railway through emerald tea estates, waterfalls and cool mountain villages across the hill country.',
      highlights: ['Ride the world-famous Kandy to Ella railway', 'Walk through working tea estates', 'Sunrise hike to Little Adam’s Peak', 'Evening ceremony at the Temple of the Tooth'],
      price: 990,
      currency: 'USD',
      minTravelers: 2,
      maxTravelers: 16,
      rating: 4.8,
      reviewsCount: 145,
      status: 'published',
    },
    {
      name: 'Ancient Ceylon',
      category: 'Best Seller',
      tourType: 'Group',
      heroImage: '/pkg-cultural-triangle-odyssey.jpg',
      gallery: ['/pkg-cultural-triangle-odyssey.jpg'],
      destinations: dest(['Sigiriya', 'Kandy']),
      activities: acts(['Sigiriya Rock Climb', 'Temple of the Tooth Tour']),
      hotels: [hotel('Water Garden Sigiriya'), hotel('Kandy Lake Residence')].filter(Boolean),
      durationDays: 7,
      durationNights: 6,
      itinerary: [
        { dayNumber: 1, title: 'Arrival & Cultural Triangle', description: 'Arrive and transfer to Sigiriya, settling into a lagoon-side lodge beneath the Lion Rock.', destinations: dest(['Sigiriya']), hotel: hotel('Water Garden Sigiriya'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Sigiriya Rock Fortress', description: 'Climb the 5th-century Lion Rock fortress at sunrise to beat the heat and the crowds.', destinations: dest(['Sigiriya']), activities: acts(['Sigiriya Rock Climb']), hotel: hotel('Water Garden Sigiriya'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'Village & Countryside', description: 'A relaxed day exploring rural villages by tuk-tuk and bicycle around the Cultural Triangle.', destinations: dest(['Sigiriya']), hotel: hotel('Water Garden Sigiriya'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Onward to Kandy', description: 'Drive to Kandy via the Matale spice gardens, arriving in time to explore the lake promenade.', destinations: dest(['Kandy']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 5, title: 'Temple of the Tooth', description: 'Visit Sri Lanka’s most sacred temple and the Royal Botanical Gardens at Peradeniya.', destinations: dest(['Kandy']), activities: acts(['Temple of the Tooth Tour']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 6, title: 'Kandyan Culture', description: 'An evening of traditional Kandyan dance and drumming followed by a farewell dinner.', destinations: dest(['Kandy']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 7, title: 'Departure', description: 'Transfer back to Colombo for your onward flight.', destinations: dest(['Kandy']), meals: ['Breakfast'] },
      ],
      includedServices: ['Air-conditioned group transport', 'Daily breakfast', 'Entrance fees for listed sites', 'English-speaking guide'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Lunch & dinner unless stated'],
      description: 'Ancient cities, sacred temples and the majestic climb of Sigiriya through Sri Lanka’s cultural heartland.',
      highlights: ['Sunrise climb of Sigiriya Rock Fortress', 'Sacred Temple of the Tooth in Kandy', 'Traditional Kandyan dance performance', 'Rural village and spice garden visits'],
      price: 1350,
      currency: 'USD',
      minTravelers: 2,
      maxTravelers: 16,
      rating: 4.9,
      reviewsCount: 201,
      status: 'published',
      isFeatured: true,
    },
    {
      name: 'Beyond Paradise',
      category: 'Luxury',
      tourType: 'Private',
      heroImage: '/pkg-grand-sri-lanka-discovery.jpg',
      gallery: ['/pkg-grand-sri-lanka-discovery.jpg'],
      destinations: dest(['Sigiriya', 'Kandy', 'Ella', 'Yala', 'Mirissa', 'Galle']),
      activities: acts(['Sigiriya Rock Climb', 'Temple of the Tooth Tour', 'Scenic Train Journey', 'Wildlife Safari', 'Whale Watching', 'Galle Fort Walking Tour']),
      hotels: [hotel('Water Garden Sigiriya'), hotel('Kandy Lake Residence'), hotel('Ella Flower Garden Resort'), hotel('Cinnamon Wild Yala'), hotel('Mirissa Beach Villas'), hotel('Jetwing Lighthouse Galle')].filter(Boolean),
      durationDays: 10,
      durationNights: 9,
      itinerary: [
        { dayNumber: 1, title: 'Arrival in Sigiriya', description: 'Private transfer to a lagoon-side lodge beneath the Lion Rock.', destinations: dest(['Sigiriya']), hotel: hotel('Water Garden Sigiriya'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Sigiriya Rock Fortress', description: 'A private sunrise climb of the ancient fortress, followed by a leisurely afternoon.', destinations: dest(['Sigiriya']), activities: acts(['Sigiriya Rock Climb']), hotel: hotel('Water Garden Sigiriya'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'Onward to Kandy', description: 'Scenic drive to Kandy with a stop at the Matale spice gardens.', destinations: dest(['Kandy']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Temple of the Tooth', description: 'Private tour of the sacred temple and botanical gardens.', destinations: dest(['Kandy']), activities: acts(['Temple of the Tooth Tour']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 5, title: 'Scenic Rail to Ella', description: 'Reserved observation-carriage seats on the celebrated hill-country railway.', destinations: dest(['Ella']), activities: acts(['Scenic Train Journey']), hotel: hotel('Ella Flower Garden Resort'), meals: ['Breakfast'] },
        { dayNumber: 6, title: 'Ella to Yala', description: 'Drive south into wildlife country, arriving in time for an evening at leisure.', destinations: dest(['Yala']), hotel: hotel('Cinnamon Wild Yala'), meals: ['Breakfast'] },
        { dayNumber: 7, title: 'Yala Safari', description: 'A full-day private safari tracking leopards, elephants and painted savannas.', destinations: dest(['Yala']), activities: acts(['Wildlife Safari']), hotel: hotel('Cinnamon Wild Yala'), meals: ['Breakfast'] },
        { dayNumber: 8, title: 'Onward to Mirissa', description: 'Transfer to the south coast for whale watching and beach time.', destinations: dest(['Mirissa']), activities: acts(['Whale Watching']), hotel: hotel('Mirissa Beach Villas'), meals: ['Breakfast'] },
        { dayNumber: 9, title: 'Galle Fort', description: 'A guided walk through the UNESCO fort city, with a private sunset dinner on the ramparts.', destinations: dest(['Galle']), activities: acts(['Galle Fort Walking Tour']), hotel: hotel('Jetwing Lighthouse Galle'), meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 10, title: 'Departure', description: 'Private transfer back to Colombo for your flight home.', destinations: dest(['Galle']), meals: ['Breakfast'] },
      ],
      includedServices: ['Private air-conditioned vehicle & chauffeur', 'Daily breakfast', 'Private guide throughout', 'All activities & entrance fees listed', 'One private dinner experience'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Lunch & dinner unless stated'],
      description: 'The complete island journey — culture, wildlife, tea country and pristine beaches in one epic private tour.',
      highlights: ['Every region of the island in one trip', 'Private safari in Yala National Park', 'Reserved seats on the scenic hill railway', 'Private sunset dinner in Galle Fort'],
      price: 3290,
      discountPrice: 2890,
      currency: 'USD',
      minTravelers: 2,
      maxTravelers: 6,
      rating: 5.0,
      reviewsCount: 34,
      status: 'published',
    },
    {
      name: 'Royal Ceylon',
      category: 'Signature',
      tourType: 'Group',
      heroImage: '/package-royal-ceylon.jpg',
      gallery: ['/package-royal-ceylon.jpg'],
      destinations: dest(['Sigiriya', 'Kandy', 'Nuwara Eliya', 'Galle']),
      activities: acts(['Sigiriya Rock Climb', 'Temple of the Tooth Tour', 'Tea Plantation Tours', 'Galle Fort Walking Tour']),
      hotels: [hotel('Water Garden Sigiriya'), hotel('Kandy Lake Residence'), hotel('Jetwing Lighthouse Galle')].filter(Boolean),
      durationDays: 8,
      durationNights: 7,
      itinerary: [
        { dayNumber: 1, title: 'Arrival in Sigiriya', description: 'Transfer to the Cultural Triangle and settle in beneath the Lion Rock.', destinations: dest(['Sigiriya']), hotel: hotel('Water Garden Sigiriya'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Sigiriya Rock Fortress', description: 'Climb the ancient rock fortress and explore its frescoes and royal gardens.', destinations: dest(['Sigiriya']), activities: acts(['Sigiriya Rock Climb']), hotel: hotel('Water Garden Sigiriya'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'Onward to Kandy', description: 'Drive to the hill capital via the Matale spice gardens.', destinations: dest(['Kandy']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Temple of the Tooth', description: 'Visit the sacred temple and enjoy an evening of traditional Kandyan dance.', destinations: dest(['Kandy']), activities: acts(['Temple of the Tooth Tour']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 5, title: 'Into Tea Country', description: 'Drive up to Nuwara Eliya, touring a working tea estate and factory.', destinations: dest(['Nuwara Eliya']), activities: acts(['Tea Plantation Tours']), hotel: hotel('Kandy Lake Residence'), meals: ['Breakfast'] },
        { dayNumber: 6, title: 'South to Galle', description: 'Scenic drive to the south coast and the historic Galle Fort.', destinations: dest(['Galle']), hotel: hotel('Jetwing Lighthouse Galle'), meals: ['Breakfast'] },
        { dayNumber: 7, title: 'Galle Fort Walking Tour', description: 'Explore cobbled lanes and colonial ramparts with a farewell dinner by the ocean.', destinations: dest(['Galle']), activities: acts(['Galle Fort Walking Tour']), hotel: hotel('Jetwing Lighthouse Galle'), meals: ['Breakfast', 'Dinner'] },
        { dayNumber: 8, title: 'Departure', description: 'Transfer back to Colombo for your onward flight.', destinations: dest(['Galle']), meals: ['Breakfast'] },
      ],
      includedServices: ['Air-conditioned group transport', 'Daily breakfast', 'English-speaking guide', 'Entrance fees for listed sites'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Lunch & dinner unless stated'],
      description: 'A first-timer’s grand tour through ancient cities, sacred temples, misty tea country and the southern coast.',
      highlights: ['Sigiriya Rock Fortress at dawn', 'Kandyan dance performance', 'Working tea estate in Nuwara Eliya', 'Historic Galle Fort by the ocean'],
      price: 1690,
      currency: 'USD',
      minTravelers: 2,
      maxTravelers: 16,
      rating: 4.8,
      reviewsCount: 178,
      status: 'published',
    },
    {
      name: 'Wildlife Explorer',
      category: 'Wildlife',
      tourType: 'Private',
      heroImage: '/package-wildlife-explorer.jpg',
      gallery: ['/package-wildlife-explorer.jpg'],
      destinations: dest(['Yala', 'Bentota']),
      activities: acts(['Wildlife Safari', 'Udawalawe Elephant Safari', 'River Safari & Turtle Hatchery']),
      hotels: [hotel('Cinnamon Wild Yala'), hotel('Taru Villas Bentota')].filter(Boolean),
      durationDays: 4,
      durationNights: 3,
      itinerary: [
        { dayNumber: 1, title: 'Arrival & Transfer to Yala', description: 'Private transfer straight to the edge of Yala National Park.', destinations: dest(['Yala']), hotel: hotel('Cinnamon Wild Yala'), meals: ['Dinner'] },
        { dayNumber: 2, title: 'Yala Leopard Safari', description: 'Full-day jeep safari tracking leopards, elephants and painted savannas.', destinations: dest(['Yala']), activities: acts(['Wildlife Safari']), hotel: hotel('Cinnamon Wild Yala'), meals: ['Breakfast'] },
        { dayNumber: 3, title: 'Udawalawe Elephants', description: 'Morning safari among Udawalawe’s open grasslands, then transfer to Bentota for a river safari.', activities: acts(['Udawalawe Elephant Safari', 'River Safari & Turtle Hatchery']), destinations: dest(['Bentota']), hotel: hotel('Taru Villas Bentota'), meals: ['Breakfast'] },
        { dayNumber: 4, title: 'Departure', description: 'A relaxed riverside breakfast before transferring to Colombo for departure.', destinations: dest(['Bentota']), meals: ['Breakfast'] },
      ],
      includedServices: ['Private 4x4 jeep safaris', 'Daily breakfast', 'Park entrance fees', 'Private air-conditioned transport'],
      excludedServices: ['International flights', 'Visa fees', 'Travel insurance', 'Lunch & dinner unless stated'],
      description: 'Track leopards and elephants across Yala and Udawalawe on an immersive private safari escape.',
      highlights: ['Private jeep safaris in two national parks', 'Highest density of leopards in the world', 'Elephant Transit Home visit', 'Riverside mangrove safari finale'],
      price: 890,
      currency: 'USD',
      minTravelers: 1,
      maxTravelers: 6,
      rating: 4.7,
      reviewsCount: 91,
      status: 'published',
      isFeatured: true,
    },
  ];
}

async function seed() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // Superadmin
  const adminEmail = 'admin@roxavaltravels.com';
  let user = await User.findOne({ email: adminEmail });
  if (!user) {
    user = await User.create({
      fullName: 'Roxaval Super Admin',
      email: adminEmail,
      password: 'ChangeMe123!',
      role: 'superadmin',
    });
    await Admin.create({ user: user._id, department: 'management', isSuperAdmin: true, permissions: ['*'] });
    console.log(`Superadmin created: ${adminEmail} / ChangeMe123! (please change immediately)`);
  } else {
    console.log('Superadmin already exists, skipping.');
  }

  // Destinations
  // Note: findOneAndUpdate bypasses the model's pre('save') slug hook, so the
  // slug is computed here to avoid every upserted doc colliding on slug: null.
  // Seed content above stays plain-English strings for readability — wrapped
  // into the {en,de,fr} localized shape here, at insert time, so admins can
  // fill in German/French translations later without touching this data.
  const t = (s) => ({ en: s || '', de: '', fr: '' });
  const tArr = (arr) => (arr || []).map((s) => ({ en: s, de: '', fr: '' }));

  const destMap = {};
  for (const d of destinationsSeed) {
    const plainName = d.name;
    const slug = slugify(plainName, { lower: true, strict: true });
    const payload = {
      ...d,
      slug,
      name: t(plainName),
      description: t(d.description),
      history: t(d.history),
      whyVisit: tArr(d.whyVisit),
      popularActivities: tArr(d.popularActivities),
      travelTips: tArr(d.travelTips),
    };
    // eslint-disable-next-line no-await-in-loop
    const doc = await Destination.findOneAndUpdate({ 'name.en': plainName }, payload, { upsert: true, new: true });
    destMap[plainName] = doc._id;
  }
  for (const [name, nearbyNames] of Object.entries(nearbyDestinationsByName)) {
    if (!destMap[name]) continue;
    const nearbyIds = nearbyNames.map((n) => destMap[n]).filter(Boolean);
    // eslint-disable-next-line no-await-in-loop
    await Destination.findByIdAndUpdate(destMap[name], { nearbyDestinations: nearbyIds });
  }
  console.log(`Seeded ${destinationsSeed.length} destinations.`);

  // Hotels
  const hotelMap = {};
  for (const h of hotelsSeed) {
    const { destination, name, address, description, amenities, roomTypes, ...rest } = h;
    const slug = `${slugify(name, { lower: true, strict: true })}-hotel`;
    const payload = {
      ...rest,
      slug,
      destination: destMap[destination],
      name: t(name),
      address: t(address),
      description: t(description),
      amenities: tArr(amenities),
      roomTypes: (roomTypes || []).map((rt) => ({ ...rt, name: t(rt.name), amenities: tArr(rt.amenities) })),
    };
    // eslint-disable-next-line no-await-in-loop
    const doc = await Hotel.findOneAndUpdate({ 'name.en': name }, payload, { upsert: true, new: true });
    hotelMap[name] = doc._id;
  }
  console.log(`Seeded ${hotelsSeed.length} hotels.`);

  // Tour Guides
  for (const g of tourGuidesSeed) {
    const slug = slugify(g.name, { lower: true, strict: true });
    // eslint-disable-next-line no-await-in-loop
    await TourGuide.findOneAndUpdate({ name: g.name }, { ...g, slug }, { upsert: true, new: true });
  }
  console.log(`Seeded ${tourGuidesSeed.length} tour guides.`);

  // Vehicles
  for (const v of vehiclesSeed) {
    const slug = slugify(v.name, { lower: true, strict: true });
    // eslint-disable-next-line no-await-in-loop
    await Vehicle.findOneAndUpdate({ name: v.name }, { ...v, slug }, { upsert: true, new: true });
  }
  console.log(`Seeded ${vehiclesSeed.length} vehicles.`);

  // Activities
  const activityMap = {};
  for (const a of activitiesSeed) {
    const { destinations, name, description, location, bestSeason, highlights, thingsIncluded, thingsToBring, ...rest } = a;
    const slug = slugify(name, { lower: true, strict: true });
    const payload = {
      ...rest,
      slug,
      destinations: (destinations || []).map((n) => destMap[n]).filter(Boolean),
      name: t(name),
      description: t(description),
      location: t(location),
      bestSeason: t(bestSeason),
      highlights: tArr(highlights),
      thingsIncluded: tArr(thingsIncluded),
      thingsToBring: tArr(thingsToBring),
    };
    // eslint-disable-next-line no-await-in-loop
    const doc = await Activity.findOneAndUpdate({ 'name.en': name }, payload, { upsert: true, new: true });
    activityMap[name] = doc._id;
  }
  console.log(`Seeded ${activitiesSeed.length} activities.`);

  // Tour Packages
  const packagesSeed = buildPackagesSeed(destMap, activityMap, hotelMap);
  for (const p of packagesSeed) {
    const plainName = p.name;
    const payload = {
      ...p,
      name: t(plainName),
      description: t(p.description),
      highlights: tArr(p.highlights),
      includedServices: tArr(p.includedServices),
      excludedServices: tArr(p.excludedServices),
      itinerary: (p.itinerary || []).map((day) => ({ ...day, title: t(day.title), description: t(day.description) })),
    };
    // eslint-disable-next-line no-await-in-loop
    const exists = await TourPackage.findOne({ 'name.en': plainName });
    if (!exists) {
      // eslint-disable-next-line no-await-in-loop
      await TourPackage.create({ ...payload, createdBy: user._id });
    } else {
      // eslint-disable-next-line no-await-in-loop
      await TourPackage.findByIdAndUpdate(exists._id, payload);
    }
  }
  console.log(`Seeded ${packagesSeed.length} tour packages.`);

  // Settings singleton — real company contact info matching Footer.tsx, so
  // the Contact Us page has real data instead of blank defaults.
  const settings = await Settings.getSingleton();
  Object.assign(settings, {
    companyName: 'Roxaval Travels',
    // Primary (Sri Lanka) office address — the UAE office (Sharjah Publishing
    // City Free Zone, Sharjah, UAE) is shown alongside this on the frontend,
    // since the schema only has room for one address.
    address: 'No 221 Ganemulla Road, Kandana, Sri Lanka',
    phone: '+94 77 880 3522',
    email: 'info@roxavaltravels.com',
    website: 'https://www.roxavaltravels.com',
    socialLinks: {
      facebook: 'https://facebook.com/roxavaltravels',
      instagram: 'https://instagram.com/roxavaltravels',
      tiktok: 'https://tiktok.com/@roxavaltravels',
      youtube: 'https://youtube.com/@roxavaltravels',
      whatsapp: '971542642902',
    },
  });
  await settings.save();
  console.log('Settings singleton seeded.');

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
