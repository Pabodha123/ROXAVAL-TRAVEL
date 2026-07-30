const Anthropic = require('@anthropic-ai/sdk');
const env = require('../config/env');
const { Destination, Activity, Hotel } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const ITINERARY_TOOL = {
  name: 'propose_itinerary',
  description: 'Propose a day-by-day Sri Lanka travel itinerary using only the given candidate IDs.',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'A 1-2 sentence overview of the trip.' },
      estimatedTotal: { type: 'number', description: 'Rough total trip cost estimate in the given currency.' },
      days: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            dayNumber: { type: 'integer' },
            title: { type: 'string' },
            schedule: { type: 'string', description: 'A short paragraph describing the day plan.' },
            destinationIds: { type: 'array', items: { type: 'string' } },
            activityIds: { type: 'array', items: { type: 'string' } },
            hotelId: { type: 'string', description: 'One hotel ID from the candidate list, or empty string if none.' },
            meals: { type: 'array', items: { type: 'string', enum: ['Breakfast', 'Lunch', 'Dinner'] } },
          },
          required: ['dayNumber', 'title', 'schedule'],
        },
      },
    },
    required: ['summary', 'days'],
  },
};

const dayCount = (travelDates) => {
  const start = new Date(travelDates.startDate);
  const end = new Date(travelDates.endDate);
  const days = Math.round((end - start) / 86400000) + 1;
  return Math.max(days, 1);
};

/**
 * Generates a draft itinerary from a customer's in-progress wizard preferences
 * via a real Claude API call, constrained to the given candidate destinations/
 * activities/hotels so it can only choose real DB documents.
 */
const generateDraftItinerary = async (preferences) => {
  if (!env.ANTHROPIC_API_KEY) {
    throw ApiError.badRequest('AI itinerary generation is not configured. Please set ANTHROPIC_API_KEY.');
  }

  const { travelDates, travelers, preferredDestinations = [], preferredActivities = [], hotelCategory, travelStyle, mealPreferences = [], transportPreference, estimatedBudget, specialRequests } = preferences;

  const [destinations, activities, hotels] = await Promise.all([
    preferredDestinations.length
      ? Destination.find({ _id: { $in: preferredDestinations } }).select('name region')
      : Destination.find({ status: 'published' }).select('name region').limit(12),
    preferredActivities.length
      ? Activity.find({ _id: { $in: preferredActivities } }).select('name category')
      : Activity.find({ status: 'published' }).select('name category').limit(12),
    Hotel.find({ status: 'active', ...(hotelCategory ? { category: hotelCategory } : {}) }).select('name category').limit(12),
  ]);

  const days = dayCount(travelDates);
  const candidateContext = {
    destinations: destinations.map((d) => ({ id: d._id.toString(), name: d.name, region: d.region })),
    activities: activities.map((a) => ({ id: a._id.toString(), name: a.name, category: a.category })),
    hotels: hotels.map((h) => ({ id: h._id.toString(), name: h.name, category: h.category })),
  };

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  let response;
  try {
    response = await anthropic.messages.create({
      model: env.ANTHROPIC_MODEL,
      max_tokens: 4096,
      system:
        'You are a Sri Lanka travel expert drafting a personalized day-by-day itinerary. ' +
        'You must only choose destinationIds/activityIds/hotelId from the candidate lists provided — never invent new ones. ' +
        'Spread the candidates sensibly across the trip; it is fine to reuse a hotel across consecutive days. ' +
        'Call the propose_itinerary tool with your answer.',
      tools: [ITINERARY_TOOL],
      tool_choice: { type: 'tool', name: 'propose_itinerary' },
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            tripLengthDays: days,
            travelers,
            hotelCategory,
            travelStyle,
            mealPreferences,
            transportPreference,
            estimatedBudget,
            specialRequests,
            candidates: candidateContext,
          }),
        },
      ],
    });
  } catch (err) {
    logger.error(`AI itinerary generation failed: ${err.message}`);
    throw ApiError.internal('Failed to generate an AI itinerary. Please try again.');
  }

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse) throw ApiError.internal('AI did not return a usable itinerary.');

  const draft = toolUse.input;
  const validDestinationIds = new Set(candidateContext.destinations.map((d) => d.id));
  const validActivityIds = new Set(candidateContext.activities.map((a) => a.id));
  const validHotelIds = new Set(candidateContext.hotels.map((h) => h.id));

  const sanitizedDays = (draft.days || []).map((day, i) => ({
    dayNumber: day.dayNumber || i + 1,
    title: day.title || `Day ${i + 1}`,
    schedule: day.schedule || '',
    destinations: (day.destinationIds || []).filter((id) => validDestinationIds.has(id)),
    activities: (day.activityIds || []).filter((id) => validActivityIds.has(id)),
    hotel: validHotelIds.has(day.hotelId) ? day.hotelId : undefined,
    meals: day.meals || [],
  }));

  return {
    summary: draft.summary || '',
    days: sanitizedDays,
    estimatedTotal: draft.estimatedTotal,
    currency: estimatedBudget?.currency || 'USD',
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { generateDraftItinerary };
