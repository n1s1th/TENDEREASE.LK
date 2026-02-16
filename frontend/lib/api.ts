// lib/api.ts
export const registerVendor = async (data: any) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('[API] Vendor registration payload:', {
    businessName: data.businessName,
    email: data.email,
    documents: [
      data.businessRegistrationDocument,
      ...(data.otherDocuments || [])
    ]
  });
  
  if (Math.random() > 0.1) {
    return {
      success: true,
      message: 'Vendor registration successful',
      vendorId: `VEND-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    success: false,
    message: 'Registration failed: Document verification pending. Please ensure all required KYC documents are uploaded.',
    errorCode: 'KYC_PENDING'
  };
};