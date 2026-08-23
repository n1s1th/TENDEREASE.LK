import { z } from 'zod';
import { useVendorStore } from '../../store/vendorRegistrationStore';

const validatePhoneNumber = (phone: string, country: string): string | null => {
  const digitsOnly = phone.replace(/\D/g, ''); // strip any non-digits
  
  if (!digitsOnly) {
    return "Telephone number is required.";
  }

  if (country === 'Sri Lanka') {
    if (!/^(?:0)?\d{9}$/.test(digitsOnly)) {
      return "Sri Lankan numbers must be 9 digits (e.g., 771234567) or 10 digits starting with 0.";
    }
  } else if (country === 'India' || country === 'United States' || country === 'Canada') {
    if (!/^\d{10}$/.test(digitsOnly)) {
      return `${country} phone numbers must be exactly 10 digits.`;
    }
  } else if (country === 'Singapore') {
    if (!/^\d{8}$/.test(digitsOnly)) {
      return "Singapore phone numbers must be exactly 8 digits.";
    }
  } else if (country === 'Australia') {
    if (!/^(?:0)?\d{9}$/.test(digitsOnly)) {
      return "Australia phone numbers must be 9 digits (or 10 digits starting with 0).";
    }
  } else if (country === 'United Kingdom' || country === 'Germany' || country === 'Japan') {
    if (!/^\d{9,11}$/.test(digitsOnly)) {
      return `${country} phone numbers must be between 9 and 11 digits.`;
    }
  } else {
    if (!/^\d{7,15}$/.test(digitsOnly)) {
      return "Please enter a valid telephone number between 7 and 15 digits.";
    }
  }
  return null;
};

const validateNicOrPassport = (value: string, country: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "NIC or Passport number is required.";
  }

  if (country === 'Sri Lanka') {
    const isOldNic = /^\d{9}[vVxX]$/.test(trimmed);
    const isNewNic = /^\d{12}$/.test(trimmed);
    const isPassport = /^[a-zA-Z0-9]{7,12}$/.test(trimmed);

    if (!isOldNic && !isNewNic && !isPassport) {
      return "For Sri Lanka, enter a valid NIC (9 digits + V/X, or 12 digits) or a Passport number.";
    }
  } else {
    if (!/^[a-zA-Z0-9 -]{5,20}$/.test(trimmed)) {
      return "Please enter a valid Passport or ID number (5 to 20 characters).";
    }
  }
  return null;
};

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
  officialTelephone: z.string().min(1, 'Valid telephone is required'),
  departments: z.array(z.string()).min(1, 'Please select at least one department')
}).superRefine((data, ctx) => {
  const errorMsg = validatePhoneNumber(data.officialTelephone, data.country);
  if (errorMsg) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: errorMsg,
      path: ['officialTelephone']
    });
  }
});

export const officerSchema = z.object({
  nicOrPassportNo: z.string().min(1, 'NIC or Passport number is required'),
  name: z.string().min(2, 'Name is required'),
  designation: z.string().min(2, 'Designation is required'),
  mobilePhone: z.string().min(1, 'Mobile phone is required'),
  email: z.string().email('Valid email is required'),
}).superRefine((data, ctx) => {
  const country = useVendorStore.getState().organizationData?.country || 'Sri Lanka';
  
  // Mobile phone validation
  const phoneError = validatePhoneNumber(data.mobilePhone, country);
  if (phoneError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: phoneError,
      path: ['mobilePhone']
    });
  }

  // NIC / Passport validation
  const nicError = validateNicOrPassport(data.nicOrPassportNo, country);
  if (nicError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: nicError,
      path: ['nicOrPassportNo']
    });
  }
});

export const termsSchema = z.object({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  })
});

