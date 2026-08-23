import axios from 'axios';
import type { OfficerRegistrationFormData } from '../validations/officerSchema';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL ? `${process.env.NEXT_PUBLIC_USER_API_URL}/officers` : 'http://localhost:8081/api/officers';

export interface OfficerSuccessResponse {
  success: boolean;
  message: string;
  data: {
    referenceId: string;
  };
}

/**
 * Failure response from the OfficerExceptionHandler.
 */
export interface OfficerFailureResponse {
  success: boolean;
  message: string;
  errorCode: string;
  errors: string[];
  supportId: string;
}

/**
 * Fallback: GlobalExceptionHandler returns a different shape for MethodArgumentNotValidException.
 */
interface GlobalErrorResponse {
  status: number;
  error: string;
  message: string;
  validationErrors?: { field: string; message: string }[];
}

/**
 * Extract human-readable error list from any backend error response.
 */
export function extractErrors(responseData: unknown): string[] {
  const data = responseData as Record<string, unknown>;

  // Case 1: OfficerExceptionHandler → { errors: string[] }
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors as string[];
  }

  // Case 2: GlobalExceptionHandler → { validationErrors: [{field,message}] }
  if (data?.validationErrors && Array.isArray(data.validationErrors)) {
    return (data.validationErrors as { field: string; message: string }[]).map(
      (ve) => `${ve.field}: ${ve.message}`
    );
  }

  // Case 3: Plain message
  if (data?.message && typeof data.message === 'string') {
    return [data.message];
  }

  return ['Registration failed: ' + (data ? JSON.stringify(data).substring(0, 300) : 'Unknown')];
}

/**
 * Extract support ID from response, if present.
 */
export function extractSupportId(responseData: unknown): string | undefined {
  const data = responseData as Record<string, unknown>;
  return typeof data?.supportId === 'string' ? data.supportId : undefined;
}

/**
 * Submit officer registration to the backend.
 * Maps the flat form data to the nested DTO structure expected by the API.
 */
export const registerOfficer = async (
  formData: OfficerRegistrationFormData
): Promise<OfficerSuccessResponse> => {
  const payload = {
    procuringEntityType: formData.procuringEntityType,
    procuringEntityLevel: formData.procuringEntityLevel,
    provincialCouncil: formData.provincialCouncil || null,
    headDesignation: formData.headDesignation,
    organizationName: formData.organizationName || null,
    address: {
      country: formData.country,
      streetLine1: formData.streetLine1 || null,
      streetLine2: formData.streetLine2 || null,
      city: formData.city || null,
      province: formData.province || null,
      postalCode: formData.postalCode || null,
    },
    personalLandPhone: formData.personalLandPhone,
    officialEmail: formData.officialEmail,
    businessRegistrationNumber: formData.businessRegistrationNumber || null,
    vatRegistrationNumber: formData.vatRegistrationNumber || null,
    liaisonOfficer: {
      title: formData.liaisonTitle,
      name: formData.liaisonName,
      designation: formData.liaisonDesignation || null,
      nic: formData.liaisonNic,
      mobile: formData.liaisonMobile,
      email: formData.liaisonEmail,
    },
    termsAccepted: formData.termsAccepted,
    keycloakUserId: formData.keycloakUserId,
  };

  const response = await axios.post<OfficerSuccessResponse>(
    `${API_BASE_URL}/register`,
    payload
  );
  return response.data;
};

export const getOfficerByEmail = async (email: string): Promise<any> => {
  const response = await axios.get(`${API_BASE_URL}/email/${encodeURIComponent(email)}`);
  return response.data;
};
