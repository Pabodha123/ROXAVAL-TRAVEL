// One-off migration: tourGuide/vehicle moved from per-day to itinerary-level
// (see plan). Uses the raw collection (not the Mongoose model) so it works
// regardless of whether it's run before or after the schema change deploys.
// Run once: node src/utils/migrateItineraryGuideVehicle.js
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

async function migrate() {
  await mongoose.connect(env.MONGO_URI);
  const col = mongoose.connection.collection('itineraries');
  const cursor = col.find({});
  let migrated = 0;
  let skipped = 0;

  // eslint-disable-next-line no-restricted-syntax
  for await (const doc of cursor) {
    const days = Array.isArray(doc.days) ? doc.days : [];
    const firstGuide = days.find((d) => d.tourGuide)?.tourGuide;
    const firstVehicle = days.find((d) => d.vehicle)?.vehicle;

    if (!firstGuide && !firstVehicle) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    const set = {};
    if (firstGuide) set.tourGuide = firstGuide;
    if (firstVehicle) set.vehicle = firstVehicle;

    // eslint-disable-next-line no-await-in-loop
    await col.updateOne(
      { _id: doc._id },
      {
        $set: set,
        $unset: { 'days.$[].tourGuide': '', 'days.$[].vehicle': '' },
      }
    );
    migrated += 1;
    console.log(`Migrated itinerary ${doc._id}: tourGuide=${firstGuide || '-'} vehicle=${firstVehicle || '-'}`);
  }

  console.log(`Done. Migrated ${migrated}, skipped ${skipped} (no per-day guide/vehicle found).`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
