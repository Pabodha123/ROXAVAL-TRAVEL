/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const { Hotel } = require('../models');

// A safe visual fallback for catalog records created without media. These are
// local, destination-specific images already used by the public site. Existing
// hotel images are never replaced by this utility.
const imageByDestination = {
  Trincomalee: '/destination-trincomalee.jpg',
  Yala: '/hotel-cinnamon-wild-yala.jpg',
  Galle: '/hotel-jetwing-lighthouse-galle.jpg',
  Mirissa: '/hotel-mirissa-beach-villas.jpg',
  Habarana: '/hotel-water-garden-sigiriya.jpg',
  Sigiriya: '/hotel-water-garden-sigiriya.jpg',
  Ella: '/hotel-ella-flower-garden.jpg',
  Kandy: '/hotel-kandy-lake-residence.jpg',
  'Nuwara Eliya': '/destination-nuwara-eliya.jpg',
  Colombo: '/destination-colombo.jpg',
  Katunayake: '/destination-colombo.jpg',
  Minuwangoda: '/destination-colombo.jpg',
  Negombo: '/destination-colombo.jpg',
  Passikudah: '/package-romantic-escape.jpg',
  Hikkaduwa: '/package-romantic-escape.jpg',
  Unawatuna: '/package-royal-ceylon.jpg',
  Thalpe: '/package-royal-ceylon.jpg',
  Kosgoda: '/package-romantic-escape.jpg',
};

async function fillMissingHotelImages() {
  await mongoose.connect(env.MONGO_URI);
  const hotels = await Hotel.find({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] }).populate('destination', 'name');

  let updated = 0;
  for (const hotel of hotels) {
    const destination = hotel.destination?.name?.en || hotel.destination?.name || '';
    const image = imageByDestination[destination] || '/hotel-water-garden-sigiriya.jpg';
    // eslint-disable-next-line no-await-in-loop
    await Hotel.findByIdAndUpdate(hotel._id, { images: [image] });
    updated += 1;
  }

  console.log(`Added images to ${updated} hotel${updated === 1 ? '' : 's'}.`);
  await mongoose.disconnect();
}

fillMissingHotelImages().catch(async (error) => {
  console.error('Failed to add missing hotel images:', error);
  await mongoose.disconnect();
  process.exit(1);
});
