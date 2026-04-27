import { z } from 'zod';

export const organizationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  registrationAuthority: z.string().min(2, 'Registration authority is required'),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  organizationType: z.string().min(1, 'Organization type is required'),
  country: z.string().min(2, 'Country is required'),
  registrationAddress: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  officialEmail: z.string().email('Valid email is required'),
  officialTelephone: z.string().min(9, 'Valid telephone is required')
});

export const officerSchema = z.object({
  nicOrPassportNo: z.string().min(5, 'NIC or Passport number is required'),
  name: z.string().min(2, 'Name is required'),
  designation: z.string().min(2, 'Designation is required'),
  mobilePhone: z.string().min(9, 'Mobile phone is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const termsSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  })
});
