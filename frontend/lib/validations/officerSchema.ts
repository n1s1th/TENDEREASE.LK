import { z } from 'zod';

/**
 * Zod schema for the Officer Registration form.
 * Matches the backend CreateOfficerRegistrationRequest DTO exactly.
 */
export const officerRegistrationSchema = z.object({
  // Procuring Entity Info
  procuringEntityType: z.string().min(1, 'Procuring Entity Type is required'),
  headDesignation: z.string().min(1, 'Designation of the Head is required'),
  organizationName: z.string().optional().or(z.literal('')),

  // Address
  country: z.string().min(1, 'Country is required'),
  streetLine1: z.string().optional().or(z.literal('')),
  streetLine2: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  province: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),

  // Contact Info
  personalLandPhone: z.string().min(1, 'Personal Land Phone is required'),
  officialEmail: z.string().min(1, 'Official Email is required').email('Enter a valid email address'),

  // Business Info (optional)
  businessRegistrationNumber: z.string().optional().or(z.literal('')),
  vatRegistrationNumber: z.string().optional().or(z.literal('')),

  // Liaison Officer
  liaisonTitle: z.string().min(1, 'Title is required'),
  liaisonName: z.string().min(1, 'Procurement Liaison Officer Name is required'),
  liaisonDesignation: z.string().optional().or(z.literal('')),
  liaisonNic: z
    .string()
    .min(1, 'NIC is required')
    .regex(/^([0-9]{9}[vVxX]|[0-9]{12})$/, 'NIC must be 9 digits + V/X or 12 digits'),
  liaisonMobile: z
    .string()
    .min(1, 'Mobile Phone with Country Code is required')
    .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid mobile number'),
  liaisonEmail: z.string().min(1, 'Email is required').email('Enter a valid email address'),

  // Terms
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the Terms and Conditions',
  }),
});

export type OfficerRegistrationFormData = z.infer<typeof officerRegistrationSchema>;
