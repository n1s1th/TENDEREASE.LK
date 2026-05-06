"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { officerSchema } from '../../../lib/validations/vendorSchema';
import { OfficerData, useVendorStore } from '../../../store/vendorRegistrationStore';
import { registerVendor } from '../../../lib/api/vendorApi';

export default function Step2Officer() {
  const { officerData, organizationData, setOfficerData, nextStep, prevStep, setVendorId } = useVendorStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<OfficerData>({
    resolver: zodResolver(officerSchema),
    defaultValues: officerData || {
      nicOrPassportNo: '',
      name: '',
      designation: '',
      mobilePhone: '',
      email: '',
    } as any
  });

  const onSubmit = async (data: OfficerData) => {
    setSubmitError(null);
    setSubmitting(true);
    setOfficerData(data);
    
    try {
      if (organizationData) {
        const res = await registerVendor(organizationData, data);
        setVendorId(res.vendorId);
        nextStep();
      } else {
        setSubmitError("Organization data is missing. Please go back and resubmit.");
      }
    } catch (e: any) {
      setSubmitError(e.response?.data?.message || "Failed to submit registration details. Note: An email or registration number uniqueness check may have failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Authorized Officer Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Please provide details of the person authorized to act on behalf of the vendor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Authorized Person's Full Name *</label>
          <input {...register('name')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Designation *</label>
          <input {...register('designation')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">NIC or Passport No *</label>
          <input {...register('nicOrPassportNo')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.nicOrPassportNo && <p className="text-red-500 text-xs">{errors.nicOrPassportNo.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <input {...register('mobilePhone')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.mobilePhone && <p className="text-red-500 text-xs">{errors.mobilePhone.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Email Address *</label>
          <input {...register('email')} type="email" className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      {submitError && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {submitError}
        </div>
      )}

      <div className="pt-6 flex justify-between border-t">
        <button type="button" onClick={prevStep} disabled={submitting} className="px-6 py-2 border text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          &larr; Back
        </button>
        <button type="submit" disabled={submitting} className="px-6 py-2 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  );
}
