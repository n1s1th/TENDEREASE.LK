// app/vendor/registration/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorRegistrationForm } from '@/lib/validation';
import { useVendorStore } from '@/lib/store';
import OrganizationDetails from './components/OrganizationDetails';
import AuthorizedOfficer from './components/AuthorizedOfficer';
import DocumentUpload from './components/DocumentUpload';
import TermsAgreement from './components/TermsAgreement';
import { registerVendor } from '@/lib/api';

export default function VendorRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { formData, setFormData } = useVendorStore();
  
  const form = useForm<VendorRegistrationForm>({
    resolver: zodResolver(VendorRegistrationForm),
    defaultValues: formData,
  });

  const { handleSubmit, control, watch, setValue } = form;

  const onSubmit = async (data: VendorRegistrationForm) => {
    setIsSubmitting(true);
    setFormData(data);
    
    try {
      const response = await registerVendor(data);
      
      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          form.reset();
          setFormData({});
          setCurrentStep(1);
        }, 3000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Thank you for registering. Your vendor account has been created successfully.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            You will receive an email confirmation shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Vendor Registration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Vendor/ Supplier Organization Details
            </p>
          </div>
          
          {/* Progress Steps - UI Style Guidelines §05 Spacing */}
          <div className="flex justify-between mb-8">
            {['Organization Details', 'Authorized Officer', 'Documents', 'Terms'].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > index + 1 ? 'bg-green-500' : 
                  currentStep === index + 1 ? 'bg-amber-500' : // Primary color #FFB401
                  'bg-gray-300'
                } text-white`}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep > index + 1 ? 'text-green-600' : 
                  currentStep === index + 1 ? 'text-amber-600' : 
                  'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <OrganizationDetails control={control} setValue={setValue} />
            )}
            {currentStep === 2 && (
              <AuthorizedOfficer control={control} setValue={setValue} />
            )}
            {currentStep === 3 && (
              <DocumentUpload control={control} setValue={setValue} />
            )}
            {currentStep === 4 && (
              <TermsAgreement control={control} />
            )}
            
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ml-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting ? 'bg-amber-400' : 'bg-amber-500 hover:bg-amber-600'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}