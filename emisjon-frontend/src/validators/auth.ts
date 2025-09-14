import { z } from 'zod';

// Norwegian error messages for better UX
const errorMessages = {
  required: 'Dette feltet er påkrevd',
  invalidEmail: 'Ugyldig e-postadresse',
  tooShort: (min: number) => `Minimum ${min} tegn`,
  tooLong: (max: number) => `Maksimum ${max} tegn`,
  passwordFormat: 'Passordet må inneholde minst 8 tegn, en stor bokstav, en liten bokstav og ett tall',
  passwordsMatch: 'Passordene må være like',
  invalidPhoneNumber: 'Ugyldig telefonnummer',
  invalidNorwegianPhone: 'Telefonnummer må være norsk (+47 eller 8 siffer)',
};

// Login schema
export const loginSchema = z.object({
  email: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required)
    .email(errorMessages.invalidEmail),

  password: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required),
});

// Registration schema
export const registerSchema = z.object({
  firstName: z
    .string({
      required_error: errorMessages.required,
    })
    .min(2, errorMessages.tooShort(2))
    .max(50, errorMessages.tooLong(50))
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, 'Kun bokstaver, mellomrom, bindestrek og apostrof er tillatt'),

  lastName: z
    .string({
      required_error: errorMessages.required,
    })
    .min(2, errorMessages.tooShort(2))
    .max(50, errorMessages.tooLong(50))
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, 'Kun bokstaver, mellomrom, bindestrek og apostrof er tillatt'),

  email: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required)
    .email(errorMessages.invalidEmail),

  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      // Allow Norwegian phone numbers in various formats
      const phoneRegex = /^(\+47)?[2-9]\d{7}$/;
      return phoneRegex.test(phone.replace(/\s+/g, ''));
    }, errorMessages.invalidNorwegianPhone),

  password: z
    .string({
      required_error: errorMessages.required,
    })
    .min(8, errorMessages.tooShort(8))
    .max(128, errorMessages.tooLong(128))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessages.passwordFormat
    ),

  confirmPassword: z
    .string({
      required_error: errorMessages.required,
    }),

  acceptedTerms: z
    .boolean({
      required_error: 'Du må godta vilkårene for å registrere deg',
    })
    .refine((val) => val === true, {
      message: 'Du må godta vilkårene for å registrere deg',
    }),

  acceptedPrivacy: z
    .boolean({
      required_error: 'Du må godta personvernreglene for å registrere deg',
    })
    .refine((val) => val === true, {
      message: 'Du må godta personvernreglene for å registrere deg',
    }),

  newsletter: z
    .boolean()
    .default(false)
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: errorMessages.passwordsMatch,
  path: ['confirmPassword'],
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required)
    .email(errorMessages.invalidEmail),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required),

  password: z
    .string({
      required_error: errorMessages.required,
    })
    .min(8, errorMessages.tooShort(8))
    .max(128, errorMessages.tooLong(128))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessages.passwordFormat
    ),

  confirmPassword: z
    .string({
      required_error: errorMessages.required,
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: errorMessages.passwordsMatch,
  path: ['confirmPassword'],
});

// Change password schema (for logged in users)
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required),

  newPassword: z
    .string({
      required_error: errorMessages.required,
    })
    .min(8, errorMessages.tooShort(8))
    .max(128, errorMessages.tooLong(128))
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      errorMessages.passwordFormat
    ),

  confirmNewPassword: z
    .string({
      required_error: errorMessages.required,
    }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: errorMessages.passwordsMatch,
  path: ['confirmNewPassword'],
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string({
      required_error: errorMessages.required,
    })
    .min(2, errorMessages.tooShort(2))
    .max(50, errorMessages.tooLong(50))
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, 'Kun bokstaver, mellomrom, bindestrek og apostrof er tillatt'),

  lastName: z
    .string({
      required_error: errorMessages.required,
    })
    .min(2, errorMessages.tooShort(2))
    .max(50, errorMessages.tooLong(50))
    .regex(/^[a-zA-ZæøåÆØÅ\s-']+$/, 'Kun bokstaver, mellomrom, bindestrek og apostrof er tillatt'),

  email: z
    .string({
      required_error: errorMessages.required,
    })
    .min(1, errorMessages.required)
    .email(errorMessages.invalidEmail),

  phone: z
    .string()
    .optional()
    .refine((phone) => {
      if (!phone) return true; // Optional field
      const phoneRegex = /^(\+47)?[2-9]\d{7}$/;
      return phoneRegex.test(phone.replace(/\s+/g, ''));
    }, errorMessages.invalidNorwegianPhone),

  newsletter: z
    .boolean()
    .default(false)
    .optional(),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Validation utility functions
export const validateLogin = (data: unknown) => loginSchema.safeParse(data);
export const validateRegister = (data: unknown) => registerSchema.safeParse(data);
export const validateForgotPassword = (data: unknown) => forgotPasswordSchema.safeParse(data);
export const validateResetPassword = (data: unknown) => resetPasswordSchema.safeParse(data);
export const validateChangePassword = (data: unknown) => changePasswordSchema.safeParse(data);
export const validateProfileUpdate = (data: unknown) => profileUpdateSchema.safeParse(data);

// Utility functions for form validation
export const isValidNorwegianPhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  const cleaned = phone.replace(/\s+/g, '');
  const phoneRegex = /^(\+47)?[2-9]\d{7}$/;
  return phoneRegex.test(cleaned);
};

export const formatNorwegianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+47/, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Minimum 8 tegn');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Minst en liten bokstav');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Minst en stor bokstav');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Minst ett tall');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
    feedback.unshift('Ekstra sterkt med spesialtegn!');
  }

  return { score, feedback };
};