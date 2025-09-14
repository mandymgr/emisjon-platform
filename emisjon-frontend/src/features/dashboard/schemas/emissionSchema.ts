import { z } from 'zod';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const baseEmissionSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  
  sharesBefore: z.number()
    .min(0, 'Shares before must be a positive number'),
  
  newSharesOffered: z.number()
    .min(1, 'New shares offered must be at least 1')
    .int('New shares offered must be a whole number'),
  
  pricePerShare: z.number()
    .min(0.01, 'Price per share must be at least 0.01')
    .multipleOf(0.01, 'Price per share must have at most 2 decimal places'),
  
  startDate: z.string()
    .min(1, 'Start date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Start date cannot be in the past'),
  
  endDate: z.string()
    .min(1, 'End date is required'),
  
  status: z.enum(['PREVIEW', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
  
  presentationFile: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    }, 'File size must be less than 50MB')
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_FILE_TYPES.includes(file.type);
    }, 'Only PDF files are allowed'),
  
  scheduledPublishDate: z.string().optional()
});

export const emissionFormSchema = baseEmissionSchema.refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export type EmissionFormData = z.infer<typeof baseEmissionSchema>;

export const validateEmissionForm = function(data: unknown) {
  return emissionFormSchema.safeParse(data);
};