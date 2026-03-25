import { z } from 'zod';

export const VendorRegistrationForm = z.object({
  // Organization Details
  businessRegistrationAuthority: z.string().min(1, 'Business Registration Authority is required'),
  businessName: z.string().min(2, 'Business Name must be at least 2 characters'),
  country: z.string().min(1, 'Country is required'),
  businessRegistrationNo: z.string().min(1, 'Business Registration No is required'),
  typeOfOrganization: z.string().min(1, 'Organization type is required'),
  registeredAddress: z.string().min(1, 'Registered Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  // Website is optional — allow empty string or valid URL
  website: z.union([
    z.string().url('Invalid website URL'),
    z.literal(''),
  ]).optional(),
  officialEmail: z.string().email('Invalid email address'),
  officialTelephone: z.string().min(1, 'Official Telephone No is required'),

  // Authorized Officer Details
  nicPassport: z.string().min(1, 'NIC/Passport No is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  mobilePhone: z.string().min(1, 'Mobile phone No is required'),
  email: z.string().email('Invalid email address'),

  // Documents — stored as actual File objects from the file input
  businessRegistrationDocument: z.any().refine(
    (val) => val instanceof File || (typeof val === 'string' && val.length > 0),
    { message: 'Business Registration Document is required' }
  ),
  otherDocuments: z.array(z.any()).optional(),

  // Terms
  termsOfUse: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms and Conditions of using the system',
  }),
  vendorAgreement: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Vendor/Supplier Agreement',
  }),
});

export type VendorRegistrationFormType = z.infer<typeof VendorRegistrationForm>;