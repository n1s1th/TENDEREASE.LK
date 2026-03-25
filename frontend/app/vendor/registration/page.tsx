// app/vendor/registration/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorRegistrationForm, VendorRegistrationFormType } from '@/lib/validation';
import { useVendorStore } from '@/lib/store';
import OrganizationDetails from './components/OrganizationDetails';
import AuthorizedOfficer from './components/AuthorizedOfficer';
import DocumentUpload from './components/DocumentUpload';
import TermsAgreement from './components/TermsAgreement';
import { registerVendor } from '@/lib/api';

// Fields belonging to each step — used to trigger per-step validation
const STEP_FIELDS: Record<number, (keyof VendorRegistrationFormType)[]> = {
  1: ['businessRegistrationAuthority', 'businessName', 'country', 'businessRegistrationNo',
    'typeOfOrganization', 'registeredAddress', 'city', 'province', 'officialEmail', 'officialTelephone'],
  2: ['nicPassport', 'name', 'designation', 'mobilePhone', 'email'],
  3: ['businessRegistrationDocument'],
  4: ['termsOfUse', 'vendorAgreement'],
};

export default function VendorRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredVendorId, setRegisteredVendorId] = useState<string | null>(null);

  const { formData, setFormData } = useVendorStore();

  const form = useForm<VendorRegistrationFormType>({
    resolver: zodResolver(VendorRegistrationForm),
    mode: 'onSubmit',
    defaultValues: {
      businessRegistrationAuthority: '',
      businessName: '',
      country: '',
      businessRegistrationNo: '',
      typeOfOrganization: '',
      registeredAddress: '',
      city: '',
      province: '',
      website: '',
      officialEmail: '',
      officialTelephone: '',
      nicPassport: '',
      name: '',
      designation: '',
      mobilePhone: '',
      email: '',
      businessRegistrationDocument: undefined,
      otherDocuments: [],
      termsOfUse: false,
      vendorAgreement: false,
      ...formData,
    },
  });

  const { handleSubmit, control, setValue, trigger, formState: { errors } } = form;

  // Validate only the current step's fields before advancing
  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await trigger(fields);
    if (valid && currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: VendorRegistrationFormType) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setFormData(data);

    try {
      const payload = new FormData();

      // Organisation Details
      payload.append('businessRegistrationAuthority', data.businessRegistrationAuthority);
      payload.append('businessName', data.businessName);
      payload.append('country', data.country);
      payload.append('businessRegistrationNo', data.businessRegistrationNo);
      payload.append('typeOfOrganization', data.typeOfOrganization);
      payload.append('registeredAddress', data.registeredAddress);
      payload.append('city', data.city);
      payload.append('province', data.province);
      if (data.website) payload.append('website', data.website);
      payload.append('officialEmail', data.officialEmail);
      payload.append('officialTelephone', data.officialTelephone);

      // Authorised Officer
      payload.append('nicPassport', data.nicPassport);
      payload.append('name', data.name);
      payload.append('designation', data.designation);
      payload.append('mobilePhone', data.mobilePhone);
      payload.append('email', data.email);

      // Documents
      if (data.businessRegistrationDocument instanceof File) {
        payload.append('businessRegistrationDocument', data.businessRegistrationDocument);
      }
      if (data.otherDocuments && Array.isArray(data.otherDocuments)) {
        for (const doc of data.otherDocuments) {
          if (doc instanceof File) {
            payload.append('otherDocuments', doc);
          }
        }
      }

      const response = await registerVendor(payload);

      if (response.success) {
        setRegisteredVendorId(response.vendorId ?? null);
        setSubmitSuccess(true);
        setTimeout(() => {
          form.reset();
          setFormData({});
          setCurrentStep(1);
        }, 5000);
      } else {
        setSubmitError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setSubmitError(error.message || 'An unexpected error occurred. Please check the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Collect any validation errors visible to show summary on step 4
  const errorMessages = Object.values(errors)
    .map((e: any) => e?.message)
    .filter(Boolean);

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
          {registeredVendorId && (
            <p className="mt-2 text-center text-sm font-semibold text-amber-600">
              Vendor ID: {registeredVendorId}
            </p>
          )}
          <p className="mt-2 text-center text-sm text-gray-600">
            Your vendor account has been created. You will receive an email confirmation shortly.
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
            <p className="mt-2 text-sm text-gray-600">Vendor / Supplier Organization Details</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {['Organization Details', 'Authorized Officer', 'Documents', 'Terms'].map((step, index) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > index + 1 ? 'bg-green-500' :
                  currentStep === index + 1 ? 'bg-amber-500' :
                    'bg-gray-300'
                  } text-white text-sm font-medium`}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`mt-2 text-xs font-medium ${currentStep > index + 1 ? 'text-green-600' :
                  currentStep === index + 1 ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Server-side error */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">⚠ {submitError}</p>
            </div>
          )}

          {/* Validation errors summary (step 4 only) */}
          {currentStep === 4 && errorMessages.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm font-medium text-yellow-800 mb-1">Please fix the following:</p>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-0.5">
                {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && <OrganizationDetails control={control} setValue={setValue} />}
            {currentStep === 2 && <AuthorizedOfficer control={control} setValue={setValue} />}
            {currentStep === 3 && <DocumentUpload control={control} setValue={setValue} />}
            {currentStep === 4 && <TermsAgreement control={control} />}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ml-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600'
                    }`}
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