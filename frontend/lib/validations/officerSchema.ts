import { z } from 'zod';

/**
 * Zod schema for the Officer Registration form.
 * Matches the backend CreateOfficerRegistrationRequest DTO exactly.
 *
 * Conditional fields:
 *   - provincialCouncil: required when procuringEntityType === 'Provincial Council'
 *   - procuringEntityLevel: required for both entity types
 */
export const officerRegistrationSchema = z
  .object({
    // Procuring Entity Info
    procuringEntityType: z.string().min(1, 'Procuring Entity Type is required'),
    procuringEntityLevel: z.string().min(1, 'Procuring Entity Level is required'),
    provincialCouncil: z.string().optional().or(z.literal('')),
    headDesignation: z.string().min(1, 'Designation of the Head is required'),
    organizationName: z.string().optional().or(z.literal('')),

    // Address
    country: z.string().min(1, 'Country is required'),
    streetLine1: z.string().min(1, 'Street Line 1 is required'),
    streetLine2: z.string().optional().or(z.literal('')),
    city: z.string().min(1, 'City is required'),
    province: z.string().optional().or(z.literal('')),
    postalCode: z.string().regex(/^\d*$/, 'Postal Code must contain numbers only').optional().or(z.literal('')),

    // Contact Info
    personalLandPhone: z
      .string()
      .min(1, 'Personal Land Phone is required')
      .regex(/^([0-9]{10}|\+[0-9]{11})$/, 'Enter 10 digits, or 12 digits with + country code (e.g. +94771234567)'),
    officialEmail: z.string().min(1, 'Official Email is required').regex(/^[^A-Z]*$/, 'Invalid email: uppercase letters are not allowed').email('Enter a valid email address'),

    // Business Info (optional)
    businessRegistrationNumber: z.string().optional().or(z.literal('')),
    vatRegistrationNumber: z.string().optional().or(z.literal('')),

    // Liaison Officer
    liaisonTitle: z.string().min(1, 'Title is required'),
    liaisonName: z.string().min(1, 'Procurement Liaison Officer Name is required'),
    liaisonDesignation: z.string().min(1, 'Designation is required'),
    liaisonNic: z
      .string()
      .min(1, 'NIC is required')
      .regex(/^([0-9]{9}[vVxX]|[0-9]{12})$/, 'NIC must be 9 digits + V/X or 12 digits'),
    liaisonMobile: z
      .string()
      .min(1, 'Mobile Phone with Country Code is required')
      .regex(/^([0-9]{10}|\+[0-9]{11})$/, 'Enter 10 digits, or 12 digits with + country code (e.g. +94771234567)'),
    liaisonEmail: z.string().min(1, 'Email is required').regex(/^[^A-Z]*$/, 'Invalid email: uppercase letters are not allowed').email('Enter a valid email address'),

    // Terms
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms and Conditions',
    }),
  })
  .superRefine((data, ctx) => {
    // Provincial Council requires selecting which province
    if (data.procuringEntityType === 'Provincial Council' && (!data.provincialCouncil || data.provincialCouncil === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provincial Council is required',
        path: ['provincialCouncil'],
      });
    }
  });

export type OfficerRegistrationFormData = z.infer<typeof officerRegistrationSchema>;
