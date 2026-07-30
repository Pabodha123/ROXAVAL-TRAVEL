const { z } = require('zod');

const createContactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Please enter a subject'),
  message: z.string().min(10, 'Please enter a message of at least 10 characters'),
});

const updateContactStatusSchema = z.object({
  status: z.enum(['New', 'Read', 'Responded']),
});

module.exports = { createContactSchema, updateContactStatusSchema };
