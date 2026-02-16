// lib/validation.ts
import { z } from 'zod';

export const VendorRegistrationForm = z.object({
  businessRegistrationAuthority: z.string().min(1, 'Business Registration Authority is required'),
  businessName: z.string().min(2, 'Business Name must be at least 2 characters'),
  country: z.string().min(1, 'Country is required'),
  businessRegistrationNo: z.string().min(1, 'Business Registration No is required'),
  typeOfOrganization: z.string().min(1, 'Organization type is required'),
  registeredAddress: z.string().min(1, 'Registered Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  officialEmail: z.string().email('Invalid email address'),
  officialTelephone: z.string().min(1, 'Official Telephone No is required'),
  nicPassport: z.string().min(1, 'NIC/Passport No is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  mobilePhone: z.string().min(1, 'Mobile phone No is required'),
  email: z.string().email('Invalid email address'),
  businessRegistrationDocument: z.string().min(1, 'Business Registration Document is required'),
  otherDocuments: z.array(z.string()).optional(),
  termsOfUse: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms and Conditions of using the system"
  }),
  vendorAgreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Vendor/Supplier Agreement"
  }),
});