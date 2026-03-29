import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.coerce.number().min(16, 'You must be at least 16 years old').max(120, 'Invalid age'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  accept_terms: z.boolean().refine((val) => val === true, 'You must accept the Terms of Service'),
  accept_privacy: z.boolean().refine((val) => val === true, 'You must accept the Privacy Policy'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
