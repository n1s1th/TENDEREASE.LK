// app/lib/api.ts
// Mock API implementation - Phase 2 Task 4 compliant (dummy data only)
// Reference: Work Distribution Phase 2 Task 4, TenderEase Report §3.2.6

/**
 * Simulates vendor registration API call
 * @param data - Vendor registration form data
 * @returns Promise with mock success/failure response
 */
export const registerVendor = async (data: any) => {
  // Simulate network delay (1.5s) per UI feedback guidelines
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Log submission for debugging (Phase 8 Task 2)
  console.log('[API] Vendor registration payload:', {
    businessName: data.businessName,
    email: data.email,
    documents: [
      data.businessRegistrationDocument,
      ...(data.otherDocuments || [])
    ]
  });
  
  // Simulate 90% success rate (real implementation would use actual API)
  if (Math.random() > 0.1) {
    return {
      success: true,
      message: 'Vendor registration successful',
      vendorId: `VEND-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
  }
  
  // Simulate validation error (Phase 2 Task 6 KYC compliance)
  return {
    success: false,
    message: 'Registration failed: Document verification pending. Please ensure all required KYC documents are uploaded.',
    errorCode: 'KYC_PENDING'
  };
};

// Export additional mock APIs for future phases (Phase 3+)
export const fetchTenders = async () => {
  // Placeholder for Phase 3 Task 2 implementation
  return { success: true, tenders: [] };
};

export const submitBid = async (bidData: any) => {
  // Placeholder for Phase 2 Task 11 implementation
  return { success: true, submissionId: 'BID-12345' };
};