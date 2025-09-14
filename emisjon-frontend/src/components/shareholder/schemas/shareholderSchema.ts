import { z } from 'zod';

// Schema for adding a new shareholder
export const addShareholderFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  
  phone: z
    .string()
    .optional(),
  
  shares: z
    .number()
    .min(1, { message: 'Shares must be at least 1' })
    .int({ message: 'Shares must be a whole number' })
    .positive({ message: 'Shares must be a positive number' }),
  
  userId: z.string().optional()
});

// Schema for editing an existing shareholder
export const editShareholderFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' }),
  
  shares: z
    .number()
    .min(1, { message: 'Shares must be at least 1' })
    .int({ message: 'Shares must be a whole number' })
    .positive({ message: 'Shares must be a positive number' })
});

export type AddShareholderFormData = z.infer<typeof addShareholderFormSchema>;
export type EditShareholderFormData = z.infer<typeof editShareholderFormSchema>;