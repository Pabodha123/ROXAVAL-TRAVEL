const { z } = require('zod');
const { localizedField, localizedFieldArray } = require('./shared/localized');

const entranceFeeSchema = z.object({
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

const mapLocationSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const createDestinationSchema = z.object({
  name: localizedField(2),
  region: z.enum(['Cultural Triangle', 'Hill Country', 'Tea Country', 'Wildlife', 'South Coast', 'West Coast', 'North', 'East']).optional(),
  tag: z.enum(['Cultural', 'Wildlife', 'Beach', 'Hill Country', 'City', 'Nature', 'Adventure']),
  description: localizedField(10),
  heroImage: z.string().url().or(z.string().min(1)),
  gallery: z.array(z.string()).optional(),
  history: localizedField(0).optional(),
  whyVisit: localizedFieldArray().optional(),
  popularActivities: localizedFieldArray().optional(),
  bestTimeToVisit: z.string().optional(),
  openingHours: z.string().optional(),
  entranceFee: entranceFeeSchema.optional(),
  travelTips: localizedFieldArray().optional(),
  nearbyDestinations: z.array(z.string()).optional(),
  mapLocation: mapLocationSchema.optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

const updateDestinationSchema = createDestinationSchema.partial();

const attractionSchema = z.object({
  name: localizedField(2),
  description: localizedField(10),
  images: z.array(z.string()).optional(),
  bestVisitingMonths: z.array(z.string()).optional(),
  estimatedVisitDuration: z.string().optional(),
  googleMapsLink: z.string().optional(),
  travelTips: localizedFieldArray().optional(),
  entryFee: z.number().min(0).optional(),
});

module.exports = { createDestinationSchema, updateDestinationSchema, attractionSchema };
