const { z } = require('zod');

const updateConfigSchema = z.object({
  subjectTemplate: z.string().min(3).optional(),
  messageTemplate: z.string().min(10).optional(),
  backgroundImageUrl: z.string().optional(),
  couponEnabled: z.boolean().optional(),
  couponDiscountPercent: z.number().min(1).max(100).optional(),
  couponValidDays: z.number().min(1).optional(),
});

module.exports = { updateConfigSchema };
