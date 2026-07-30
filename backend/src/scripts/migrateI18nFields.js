/* eslint-disable no-console */
/**
 * One-time, idempotent migration: converts pre-existing flat-string catalog
 * fields (TourPackage/Destination/Activity/Hotel/Blog) into the new
 * `{en, de, fr}` localized shape, and normalizes Customer.preferredLanguage
 * from free text ('English') to the new locale code ('en'). Safe to re-run —
 * any field already in `{en,...}` shape is left untouched.
 *
 * Run manually: node src/scripts/migrateI18nFields.js
 */
require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const env = require('../config/env');

const wrapString = (val) => (typeof val === 'string' ? { en: val, de: '', fr: '' } : val);
const wrapStringArray = (val) =>
  Array.isArray(val) && val.length && typeof val[0] === 'string' ? val.map((v) => ({ en: v, de: '', fr: '' })) : val;

function migrateSubdocArray(arr, stringFields = [], arrayFields = []) {
  if (!Array.isArray(arr)) return { changed: false, value: arr };
  let changed = false;
  const value = arr.map((item) => {
    const next = { ...item };
    stringFields.forEach((f) => {
      if (typeof item[f] === 'string') {
        next[f] = wrapString(item[f]);
        changed = true;
      }
    });
    arrayFields.forEach((f) => {
      if (Array.isArray(item[f]) && item[f].length && typeof item[f][0] === 'string') {
        next[f] = wrapStringArray(item[f]);
        changed = true;
      }
    });
    return next;
  });
  return { changed, value };
}

async function migrateCollection(db, collectionName, { stringFields = [], arrayFields = [], subdocArrays = [] }) {
  const collection = db.collection(collectionName);
  const cursor = collection.find({});
  let migrated = 0;
  let upToDate = 0;

  // eslint-disable-next-line no-restricted-syntax
  for await (const doc of cursor) {
    const update = {};
    let needsUpdate = false;

    stringFields.forEach((field) => {
      if (typeof doc[field] === 'string') {
        update[field] = wrapString(doc[field]);
        needsUpdate = true;
      }
    });

    arrayFields.forEach((field) => {
      if (Array.isArray(doc[field]) && doc[field].length && typeof doc[field][0] === 'string') {
        update[field] = wrapStringArray(doc[field]);
        needsUpdate = true;
      }
    });

    subdocArrays.forEach(({ field, stringFields: subStringFields, arrayFields: subArrayFields }) => {
      const { changed, value } = migrateSubdocArray(doc[field], subStringFields, subArrayFields);
      if (changed) {
        update[field] = value;
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      // eslint-disable-next-line no-await-in-loop
      await collection.updateOne({ _id: doc._id }, { $set: update });
      migrated += 1;
    } else {
      upToDate += 1;
    }
  }

  console.log(`${collectionName}: migrated ${migrated} doc(s), ${upToDate} already up to date.`);
}

async function migrateCustomerLanguages(db) {
  const customers = db.collection('customers');
  const result = await customers.updateMany(
    { preferredLanguage: { $exists: true, $nin: ['en', 'de', 'fr'] } },
    { $set: { preferredLanguage: 'en' } }
  );
  console.log(`customers: normalized preferredLanguage on ${result.modifiedCount} doc(s).`);
}

async function migrate() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB for i18n field migration...');
  const { db } = mongoose.connection;

  await migrateCollection(db, 'tourpackages', {
    stringFields: ['name', 'description'],
    arrayFields: ['highlights', 'includedServices', 'excludedServices'],
    subdocArrays: [{ field: 'itinerary', stringFields: ['title', 'description'] }],
  });

  await migrateCollection(db, 'destinations', {
    stringFields: ['name', 'description', 'history'],
    arrayFields: ['whyVisit', 'popularActivities', 'travelTips'],
    subdocArrays: [{ field: 'attractions', stringFields: ['name', 'description'], arrayFields: ['travelTips'] }],
  });

  await migrateCollection(db, 'activities', {
    stringFields: ['name', 'description', 'location', 'bestSeason'],
    arrayFields: ['highlights', 'thingsIncluded', 'thingsToBring'],
  });

  await migrateCollection(db, 'hotels', {
    stringFields: ['name', 'address', 'description'],
    arrayFields: ['amenities'],
    subdocArrays: [{ field: 'roomTypes', stringFields: ['name'], arrayFields: ['amenities'] }],
  });

  await migrateCollection(db, 'blogs', {
    stringFields: ['title', 'excerpt', 'content'],
  });

  await migrateCustomerLanguages(db);

  console.log('i18n field migration complete.');
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error('i18n field migration failed:', err);
  process.exit(1);
});
