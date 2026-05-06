"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { termsSchema } from '../../../lib/validations/vendorSchema';
import { useVendorStore } from '../../../store/vendorRegistrationStore';
import { submitVendor } from '../../../lib/api/vendorApi';

export default function Step4Review() {
  const router = useRouter();
  const { vendorId, organizationData, officerData, uploadedDocuments, prevStep } = useVendorStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(termsSchema),
    defaultValues: { termsAccepted: false }
  });

  const onSubmit = async () => {
    if (!vendorId) {
      setError("Registration session lost. Please try again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitVendor(vendorId);
      router.push('/vendor-registration/success');
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to submit registration.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Review & Submit</h2>
        <p className="text-gray-500 mt-1 text-sm">Please review your provided details before final submission.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Review Organization */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded">Organization Details</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 px-2 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">Business Name</dt>
            <dd className="text-gray-900">{organizationData?.businessName}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Registration Number</dt>
            <dd className="text-gray-900">{organizationData?.registrationNumber}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Organization Type</dt>
            <dd className="text-gray-900">{organizationData?.organizationType}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Official Email</dt>
            <dd className="text-gray-900">{organizationData?.officialEmail}</dd>
          </div>
          <div className="col-span-1 md:col-span-2">
            <dt className="text-gray-500 font-medium">Address</dt>
            <dd className="text-gray-900">{organizationData?.registrationAddress}, {organizationData?.city}</dd>
          </div>
        </dl>
      </div>

      {/* Review Officer */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded">Authorized Officer</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 px-2 text-sm">
          <div>
            <dt className="text-gray-500 font-medium">Name</dt>
            <dd className="text-gray-900">{officerData?.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Designation</dt>
            <dd className="text-gray-900">{officerData?.designation}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">NIC / Passport</dt>
            <dd className="text-gray-900">{officerData?.nicOrPassportNo}</dd>
          </div>
          <div>
            <dt className="text-gray-500 font-medium">Mobile & Email</dt>
            <dd className="text-gray-900">{officerData?.mobilePhone} | {officerData?.email}</dd>
          </div>
        </dl>
      </div>

      {/* Review Documents */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded">Uploaded Documents ({uploadedDocuments.length})</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 px-2">
          {uploadedDocuments.map(doc => (
            <li key={doc.docId}>
              <span className="font-medium">{doc.documentType}</span> - {doc.originalFileName}
            </li>
          ))}
        </ul>
      </div>

      {/* Terms and Conditions */}
      <div className="pt-4 border-t">
        <label className="flex items-start gap-3 cursor-pointer p-4 border rounded-md hover:bg-gray-50">
          <input 
            type="checkbox" 
            {...register('termsAccepted')} 
            className="mt-1 w-5 h-5 text-[#953002] rounded border-gray-300 focus:ring-[#953002]" 
          />
          <span className="text-sm text-gray-700">
            I declare that the information provided is true and accurate to the best of my knowledge. 
            I understand that false information may result in the rejection of this registration and potential blacklisting.
            I agree to the <a href="#" className="text-amber-600 underline">Terms and Conditions</a> of TenderEase.lk.
          </span>
        </label>
        {errors.termsAccepted && <p className="text-red-500 text-sm mt-2">{errors.termsAccepted.message as string}</p>}
      </div>

      <div className="pt-6 flex justify-between border-t mt-8">
        <button type="button" onClick={prevStep} disabled={submitting} className="px-6 py-2 border text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          &larr; Back
        </button>
        <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </form>
  );
}
