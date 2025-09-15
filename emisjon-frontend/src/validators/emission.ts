import { z } from "zod";

// Norwegian error messages for better UX
const errorMessages = {
  required: "Dette feltet er påkrevd",
  invalidEmail: "Ugyldig e-postadresse",
  tooShort: (min: number) => `Minimum ${min} tegn`,
  tooLong: (max: number) => `Maksimum ${max} tegn`,
  tooSmall: (min: number) => `Minimum verdi er ${min}`,
  tooLarge: (max: number) => `Maksimum verdi er ${max}`,
  invalidDate: "Ugyldig dato",
  futureDate: "Dato må være i fremtiden",
  endAfterStart: "Sluttdato må være etter startdato",
};

// Base emission schema without refinements
const baseEmissionSchema = z.object({
  title: z
    .string({
      required_error: errorMessages.required,
    })
    .min(3, errorMessages.tooShort(3))
    .max(100, errorMessages.tooLong(100)),

  description: z
    .string()
    .max(1000, errorMessages.tooLong(1000))
    .optional(),

  startDate: z
    .string({
      required_error: errorMessages.required,
    })
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed > new Date();
    }, {
      message: "Startdato må være i fremtiden",
    }),

  endDate: z
    .string({
      required_error: errorMessages.required,
    }),

  newSharesOffered: z
    .number({
      required_error: errorMessages.required,
      invalid_type_error: "Må være et tall",
    })
    .int("Må være et heltall")
    .min(1, errorMessages.tooSmall(1))
    .max(10000000, errorMessages.tooLarge(10000000)),

  pricePerShare: z
    .number({
      required_error: errorMessages.required,
      invalid_type_error: "Må være et tall",
    })
    .min(0.01, errorMessages.tooSmall(0.01))
    .max(1000000, errorMessages.tooLarge(1000000)),

  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "FUNDED", "CANCELLED"], {
    required_error: errorMessages.required,
  }),

  targetAmount: z
    .number()
    .min(1000, errorMessages.tooSmall(1000))
    .optional(),

  minimumInvestment: z
    .number()
    .min(100, errorMessages.tooSmall(100))
    .optional(),

  projectDetails: z.object({
    location: z
      .string()
      .max(200, errorMessages.tooLong(200))
      .optional(),

    propertyType: z
      .string()
      .max(100, errorMessages.tooLong(100))
      .optional(),

    expectedReturn: z
      .number()
      .min(0, errorMessages.tooSmall(0))
      .max(100, errorMessages.tooLarge(100))
      .optional(),

    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  }).optional(),
});

// Base emission schema for creation/editing with refinements
export const emissionSchema = baseEmissionSchema.refine((data) => {
  // Validate that end date is after start date
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: errorMessages.endAfterStart,
  path: ["endDate"], // Show error on endDate field
});

// Schema for updating emissions (all fields optional except ID)
export const updateEmissionSchema = baseEmissionSchema.partial();

// Schema for creating emissions (no ID required)
export const createEmissionSchema = emissionSchema;

// Schema for emission search/filtering
export const emissionFilterSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "FUNDED", "CANCELLED"]).optional(),
  search: z.string().max(100).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  sortBy: z.enum(["title", "startDate", "pricePerShare", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

// Investment schema for subscribing to emissions
export const investmentSchema = z.object({
  emissionId: z
    .string({
      required_error: errorMessages.required,
    })
    .uuid("Ugyldig emisjon ID"),

  numberOfShares: z
    .number({
      required_error: errorMessages.required,
      invalid_type_error: "Må være et tall",
    })
    .int("Må være et heltall")
    .min(1, errorMessages.tooSmall(1)),

  agreedToTerms: z
    .boolean({
      required_error: "Du må godta vilkårene",
    })
    .refine((val) => val === true, {
      message: "Du må godta vilkårene for å investere",
    }),

  investorType: z.enum(["INDIVIDUAL", "COMPANY"], {
    required_error: errorMessages.required,
  }),

  riskAcknowledgment: z
    .boolean({
      required_error: "Du må bekrefte at du forstår risikoen",
    })
    .refine((val) => val === true, {
      message: "Du må bekrefte at du forstår investeringsrisikoen",
    }),
});

// Type exports for TypeScript
export type EmissionFormData = z.infer<typeof emissionSchema>;
export type CreateEmissionData = z.infer<typeof createEmissionSchema>;
export type UpdateEmissionData = z.infer<typeof updateEmissionSchema>;
export type EmissionFilterData = z.infer<typeof emissionFilterSchema>;
export type InvestmentFormData = z.infer<typeof investmentSchema>;

// Validation utility functions
export const validateEmission = (data: unknown) => emissionSchema.safeParse(data);
export const validateInvestment = (data: unknown) => investmentSchema.safeParse(data);
export const validateEmissionFilter = (data: unknown) => emissionFilterSchema.safeParse(data);