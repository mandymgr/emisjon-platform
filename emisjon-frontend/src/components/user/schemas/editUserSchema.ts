import { z } from 'zod';

export const editUserFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: 'Password must be at least 8 characters if provided'
    }),
  
  role: z.enum(['USER', 'ADMIN'], {
    required_error: 'Please select a role',
    invalid_type_error: 'Role must be USER or ADMIN'
  }),
  
  level: z
    .number()
    .min(1, { message: 'Level must be at least 1' })
    .max(3, { message: 'Level must be at most 3' })
});

export type EditUserFormData = z.infer<typeof editUserFormSchema>;

export function getRoleLevelOptions(role: 'USER' | 'ADMIN'): number[] {
  if (role === 'ADMIN') {
    return [1, 2];
  }
  return [1, 2, 3];
}