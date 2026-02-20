/**
 * API Service Module - lib/api.ts
 * 
 * This module provides API communication functions for the TENDEREASE.LK frontend.
 * All API calls are directed to the Spring Boot backend running at localhost:8080
 * or a custom URL specified in the NEXT_PUBLIC_API_URL environment variable.
 * 
 * Features:
 * - Vendor registration with multipart/form-data support for file uploads
 * - Tender management (fetch, search, filter)
 * - Bid submission and management
 */

// Environment-based API URL configuration
// Uses NEXT_PUBLIC_API_URL env variable or defaults to localhost:8080 for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';


/**
 * VENDOR REGISTRATION
 * ─────────────────────────────────────────
 */

/**
 * Registers a new vendor in the system
 * 
 * This function sends vendor registration data to the backend as multipart/form-data.
 * It supports file uploads (documents, certificates, etc.) alongside form fields.
 * 
 * @param formData - FormData object containing:
 *                   - Vendor information (name, email, phone, address, etc.)
 *                   - Business registration documents
 *                   - Company certificates and licenses
 * @returns {Promise} Response object containing registration status and vendor ID
 * @throws {Error} Throws error if registration fails, with backend error message
 * 
 * IMPORTANT: Do NOT manually set Content-Type header — the browser automatically sets
 * it to 'multipart/form-data' with the correct boundary, which is required for file uploads
 */
export const registerVendor = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/vendors/register`, {
    method: 'POST',
    body: formData,
    // Content-Type is automatically set by browser with multipart boundary
  });

  const data = await response.json();

  // Error handling: throw error if response is not ok and no specific error code exists
  if (!response.ok && !data.errorCode) {
    throw new Error(data.message || 'Registration failed. Please try again.');
  }

  return data;
};

/**
 * TENDER MANAGEMENT
 * ─────────────────────────────────────────
 */

/**
 * Fetches all available tenders from the backend
 * 
 * This is a placeholder API for Phase 2 implementation.
 * Will include filtering, pagination, and search capabilities.
 * 
 * @returns {Promise} Array of tender objects with details
 * @todo Implement with pagination and filter parameters
 */
export const fetchTenders = async () => {
  const response = await fetch(`${API_BASE_URL}/api/tenders`);
  return response.json();
};

/**
 * BID MANAGEMENT
 * ─────────────────────────────────────────
 */

/**
 * Submits a new bid for a tender
 * 
 * This is a placeholder API for Phase 2 implementation.
 * Will be used by vendors to submit their bids with pricing, specifications, etc.
 * 
 * @param bidData - Object containing bid details:
 *                  - tenderId: ID of the tender to bid on
 *                  - vendorId: ID of the bidding vendor
 *                  - amount: Bid amount
 *                  - documents: Additional bid documents
 * @returns {Promise} Response object with bid submission status and bid ID
 * @todo Implement bid validation and document handling
 */
export const submitBid = async (bidData: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}/api/bids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bidData),
  });
  return response.json();
};