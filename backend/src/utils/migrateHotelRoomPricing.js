// One-off migration: seed the new per-occupancy roomTypes[].pricing.double
// with the existing flat pricePerNight, so the itinerary builder's hotel
// picker isn't all-zeros for pre-existing hotels. Admin refines per-occupancy
// prices afterward via the Hotel admin form.
// Run once: node src/utils/migrateHotelRoomPricing.js
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

async function migrate() {
  await mongoose.connect(env.MONGO_URI);
  const col = mongoose.connection.collection('hotels');
  const cursor = col.find({});
  let migrated = 0;
  let skipped = 0;

  // eslint-disable-next-line no-restricted-syntax
  for await (const doc of cursor) {
    const roomTypes = Array.isArray(doc.roomTypes) ? doc.roomTypes : [];
    if (roomTypes.length === 0) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    let changed = false;
    const nextRoomTypes = roomTypes.map((rt) => {
      if (rt.pricing && rt.pricing.double) return rt;
      changed = true;
      return {
        ...rt,
        pricing: {
          single: rt.pricing?.single || 0,
          double: rt.pricePerNight || 0,
          triple: rt.pricing?.triple || 0,
          quad: rt.pricing?.quad || 0,
          extraBed: rt.pricing?.extraBed || 0,
          childWithBed: rt.pricing?.childWithBed || 0,
          childNoBed: rt.pricing?.childNoBed || 0,
          infant: rt.pricing?.infant || 0,
        },
        mealPlan: rt.mealPlan || 'Bed & Breakfast',
      };
    });

    if (!changed) {
      skipped += 1;
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await col.updateOne({ _id: doc._id }, { $set: { roomTypes: nextRoomTypes } });
    migrated += 1;
    console.log(`Migrated hotel ${doc._id}: seeded pricing.double for ${nextRoomTypes.length} room type(s)`);
  }

  console.log(`Done. Migrated ${migrated}, skipped ${skipped} (no room types or already seeded).`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
