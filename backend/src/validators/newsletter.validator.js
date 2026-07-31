const { z } = require('zod');

const subscribeNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

module.exports = { subscribeNewsletterSchema };
