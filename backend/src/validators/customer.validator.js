const { z } = require('zod');

const createCustomerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  passportNumber: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

module.exports = { createCustomerSchema };
