"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organizationSchema } from '../../../lib/validations/vendorSchema';
import { OrgData, useVendorStore } from '../../../store/vendorRegistrationStore';
import { verifyRegistration } from '../../../lib/api/vendorApi';
import { MultiSelect } from '@/components/ui/multi-select';
import { useAuthStore } from '@/store';

const DEPARTMENT_OPTIONS = [
  { label: 'Department of the Registrar of Companies', value: 'ROC' },
  { label: 'Department of National Planning', value: 'DNP' },
  { label: 'Department of External Resources', value: 'ERD' },
  { label: 'Department of Inland Revenue', value: 'IRD' },
  { label: 'Ministry of Finance', value: 'MOF' },
  { label: 'Education Department', value: 'EDUCATION' },
  { label: 'Agriculture Department', value: 'AGRICULTURE' },
  { label: 'Health Department', value: 'HEALTH' },
  { label: 'Information Technology Department', value: 'IT' },
  { label: 'Transportation Department', value: 'TRANSPORT' },
];

export default function Step1Organization() {
  const { organizationData, setOrganizationData, nextStep, setVerified, isVerified, verifiedCompanyName } = useVendorStore();
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<OrgData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: organizationData || {
      businessName: '',
      registrationAuthority: 'Department of the Registrar of Companies',
      registrationNumber: '',
      organizationType: '',
      country: 'Sri Lanka',
      registrationAddress: '',
      city: '',
      province: '',
      website: '',
      officialEmail: '',
      officialTelephone: '',
      departments: []
    }
  });

  useEffect(() => {
    if (user?.email && !organizationData?.officialEmail) {
      setValue('officialEmail', user.email);
    }
  }, [user, setValue, organizationData]);

  const certificateNo = watch('registrationNumber');

  const handleVerify = async () => {
    if (!certificateNo) {
      setVerifyError("Please enter a registration number first.");
      return;
    }
    
    setVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyRegistration(certificateNo);
      if (result.verified) {
        setVerified(true, result.companyName);
      } else {
        setVerified(false);
        setVerifyError(result.message || "Verification failed");
      }
    } catch (e: any) {
      setVerified(false);
      setVerifyError("Failed to reach verification service.");
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = (data: OrgData) => {
    if (!isVerified) {
      setVerifyError("Please verify your business registration number before proceeding.");
      return;
    }
    setOrganizationData(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Organization Details</h2>
        <p className="text-gray-500 mt-1 text-sm">Please provide accurate details as requested below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Business Registration Number *</label>
          <div className="flex gap-2">
            <input 
              {...register('registrationNumber')} 
              className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              placeholder="e.g. PV00309389"
            />
            <button 
              type="button" 
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50 min-w-[100px]"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          {errors.registrationNumber && <p className="text-red-500 text-xs">{errors.registrationNumber.message}</p>}
          
          {verifyError && <p className="text-red-500 text-sm font-medium mt-1">❌ {verifyError}</p>}
          {isVerified && <p className="text-green-600 text-sm font-medium mt-1">✅ Verified: {verifiedCompanyName}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Business Name *</label>
          <input {...register('businessName')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.businessName && <p className="text-red-500 text-xs">{errors.businessName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Registration Authority *</label>
          <input {...register('registrationAuthority')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.registrationAuthority && <p className="text-red-500 text-xs">{errors.registrationAuthority.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Select Departments *</label>
          <Controller
            name="departments"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={DEPARTMENT_OPTIONS}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder="Search and select departments..."
              />
            )}
          />
          <p className="text-xs text-gray-400">Select one or more departments you are registering with.</p>
          {errors.departments && <p className="text-red-500 text-xs">{errors.departments.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Organization Type *</label>
          <select {...register('organizationType')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 bg-white">
            <option value="">Select Type...</option>
            <option value="SOLE_PROPRIETORSHIP">Sole Proprietorship</option>
            <option value="PARTNERSHIP">Partnership</option>
            <option value="PRIVATE_LIMITED">Private Limited</option>
            <option value="PUBLIC_LIMITED">Public Limited</option>
            <option value="GOVERNMENT_ENTITY">Government Entity</option>
            <option value="NGO">NGO</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.organizationType && <p className="text-red-500 text-xs">{errors.organizationType.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Country *</label>
          <input {...register('country')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Registration Address *</label>
          <input {...register('registrationAddress')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.registrationAddress && <p className="text-red-500 text-xs">{errors.registrationAddress.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">City *</label>
          <input {...register('city')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Province *</label>
          <input {...register('province')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.province && <p className="text-red-500 text-xs">{errors.province.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Official Email *</label>
          <input 
            {...register('officialEmail')} 
            type="email" 
            readOnly={!!user?.email} 
            className={`flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 ${
              user?.email ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''
            }`} 
          />
          {errors.officialEmail && <p className="text-red-500 text-xs">{errors.officialEmail.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Official Telephone *</label>
          <input {...register('officialTelephone')} className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.officialTelephone && <p className="text-red-500 text-xs">{errors.officialTelephone.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input {...register('website')} type="url" placeholder="https://" className="flex border rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500" />
          {errors.website && <p className="text-red-500 text-xs">{errors.website.message}</p>}
        </div>
      </div>

      <div className="pt-6 flex justify-end border-t">
        <button type="submit" className="px-6 py-2 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors">
          Next Step &rarr;
        </button>
      </div>
    </form>
  );
}
