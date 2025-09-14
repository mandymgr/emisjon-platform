import { z } from 'zod';

export const userFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string().optional(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  
  role: z.enum(['USER', 'ADMIN'], {
    required_error: 'Role is required',
    invalid_type_error: 'Invalid role',
  }).default('USER'),
  
  level: z.number()
    .int('Level must be an integer')
    .min(1, 'Level must be at least 1')
    .max(3, 'Level must be at most 3')
    .default(1)
}).refine((data) => {
  // Validate that ADMIN users can only have level 1 or 2
  if (data.role === 'ADMIN' && data.level > 2) {
    return false;
  }
  return true;
}, {
  message: 'Admin users can only have level 1 or 2',
  path: ['level']
});

// Type for the form data
export type UserFormData = z.infer<typeof userFormSchema>;

// Validation function
export const validateUserForm = function(data: unknown) {
  return userFormSchema.safeParse(data);
};

// Get level options based on role
export const getRoleLevelOptions = function(role: 'USER' | 'ADMIN'): number[] {
  if (role === 'ADMIN') {
    return [1, 2];
  }
  return [1, 2, 3];
};