// app/lib/api.ts
// Real API implementation - calls Spring Boot backend at localhost:8080

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Registers a new vendor by sending multipart/form-data to the backend.
 * @param formData - FormData object containing all registration fields + files
 */
export const registerVendor = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/vendors/register`, {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type header — browser sets it automatically with boundary for multipart
  });

  const data = await response.json();

  if (!response.ok && !data.errorCode) {
    throw new Error(data.message || 'Registration failed. Please try again.');
  }

  return data;
};

// Placeholder APIs for future phases
export const fetchTenders = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tenders`);
  return response.json();
};

export const submitBid = async (bidData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bidData),
  });
  return response.json();
};