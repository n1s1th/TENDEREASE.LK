// Mock API functions - no real API integration

export const registerVendor = async (data: any) => {
  // Simulate API call with some delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real implementation, this would call the actual API
  console.log('Registering vendor:', data);
  
  // Simulate success 90% of the time, failure 10% of the time
  if (Math.random() > 0.1) {
    return {
      success: true,
      message: 'Vendor registration successful',
      vendorId: 'VEND-' + Math.floor(100000 + Math.random() * 900000)
    };
  } else {
    return {
      success: false,
      message: 'Registration failed. Please try again.'
    };
  }
};