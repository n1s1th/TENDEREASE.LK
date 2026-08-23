"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { officerSchema } from '../../../lib/validations/vendorSchema';
import { OfficerData, useVendorStore } from '../../../store/vendorRegistrationStore';
import { registerVendor } from '../../../lib/api/vendorApi';
import { useAuthStore } from '@/store';

const COUNTRY_CODES: { [key: string]: { name: string; code: string } } = {
  'Sri Lanka': { name: 'Sri Lanka', code: '+94' },
  'India': { name: 'India', code: '+91' },
  'United Kingdom': { name: 'United Kingdom', code: '+44' },
  'United States': { name: 'United States', code: '+1' },
  'Australia': { name: 'Australia', code: '+61' },
  'Canada': { name: 'Canada', code: '+1' },
  'Singapore': { name: 'Singapore', code: '+65' },
  'Japan': { name: 'Japan', code: '+81' },
  'Germany': { name: 'Germany', code: '+49' },
  'Other': { name: 'Other', code: '' }
};

export default function Step2Officer() {
  const { officerData, organizationData, setOfficerData, nextStep, prevStep, setVendorId } = useVendorStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const inputCls = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-75";

  const selectedCountry = organizationData?.country || 'Sri Lanka';
  const prefix = COUNTRY_CODES[selectedCountry]?.code || '';

  const getInitialPhoneWithoutPrefix = (phone: string, country: string) => {
    const defaultPrefix = COUNTRY_CODES[country]?.code || '';
    if (defaultPrefix && phone.startsWith(defaultPrefix)) {
      return phone.slice(defaultPrefix.length);
    }
    for (const key of Object.keys(COUNTRY_CODES)) {
      const p = COUNTRY_CODES[key].code;
      if (p && phone.startsWith(p)) {
        return phone.slice(p.length);
      }
    }
    return phone;
  };

  const initialPhone = officerData?.mobilePhone 
    ? getInitialPhoneWithoutPrefix(officerData.mobilePhone, selectedCountry)
    : '';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OfficerData>({
    resolver: zodResolver(officerSchema),
    mode: 'onChange',
    defaultValues: {
      nicOrPassportNo: officerData?.nicOrPassportNo || '',
      name: officerData?.name || '',
      designation: officerData?.designation || '',
      mobilePhone: initialPhone,
      email: officerData?.email || '',
    } as any
  });

  useEffect(() => {
    if (user) {
      if (user.name && !officerData?.name) {
        setValue('name', user.name);
      }
      if (user.email && !officerData?.email) {
        setValue('email', user.email);
      }
    }
  }, [user, setValue, officerData]);

  const onSubmit = async (data: OfficerData) => {
    setSubmitError(null);
    setSubmitting(true);

    const updatedData = { ...data };
    if (prefix && !updatedData.mobilePhone.startsWith(prefix)) {
      updatedData.mobilePhone = `${prefix}${updatedData.mobilePhone}`;
    }

    setOfficerData(updatedData);
    
    try {
      if (organizationData) {
        const orgPrefix = COUNTRY_CODES[organizationData.country]?.code || '';
        const updatedOrgData = { ...organizationData };
        if (orgPrefix && !updatedOrgData.officialTelephone.startsWith(orgPrefix)) {
          updatedOrgData.officialTelephone = `${orgPrefix}${updatedOrgData.officialTelephone}`;
        }

        const res = await registerVendor(updatedOrgData, updatedData);
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
          <input {...register('name')} className={inputCls} />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Designation *</label>
          <input {...register('designation')} className={inputCls} />
          {errors.designation && <p className="text-red-500 text-xs">{errors.designation.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">NIC or Passport No *</label>
          <input {...register('nicOrPassportNo')} className={inputCls} />
          {errors.nicOrPassportNo && <p className="text-red-500 text-xs">{errors.nicOrPassportNo.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
          <div className="flex rounded-md shadow-sm">
            {prefix && (
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none font-medium h-10">
                {prefix}
              </span>
            )}
            <input 
              {...register('mobilePhone')} 
              className={`${inputCls} ${prefix ? 'rounded-l-none border-l-0' : ''}`}
            />
          </div>
          {errors.mobilePhone && <p className="text-red-500 text-xs">{errors.mobilePhone.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Email Address *</label>
          <input {...register('email')} type="email" className={inputCls} />
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
