"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/home/Navbar';
import { officerRegistrationSchema, type OfficerRegistrationFormData } from '../../lib/validations/officerSchema';
import { registerOfficer, extractErrors, extractSupportId } from '../../lib/api/officerApi';
import { useOfficerStore } from '../../store/officerRegistrationStore';
import axios from 'axios';

const COUNTRIES = [
  'Sri Lanka', 'India', 'United Kingdom', 'United States', 'Australia',
  'Canada', 'Singapore', 'Japan', 'Germany', 'Other'
];

const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev'];

export default function OfficerRegistrationPage() {
  const router = useRouter();
  const { setResult, setSubmitting } = useOfficerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfficerRegistrationFormData>({
    resolver: zodResolver(officerRegistrationSchema),
    defaultValues: {
      procuringEntityType: '',
      headDesignation: '',
      organizationName: '',
      country: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      province: '',
      postalCode: '',
      personalLandPhone: '',
      officialEmail: '',
      businessRegistrationNumber: '',
      vatRegistrationNumber: '',
      liaisonTitle: '',
      liaisonName: '',
      liaisonDesignation: '',
      liaisonNic: '',
      liaisonMobile: '',
      liaisonEmail: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: OfficerRegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitting(true);

    try {
      const response = await registerOfficer(data);
      setResult({
        success: true,
        referenceId: response.data.referenceId,
      });
      router.push('/officer-registration/success');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setResult({
          success: false,
          errors: extractErrors(error.response.data),
          supportId: extractSupportId(error.response.data),
        });
      } else {
        setResult({
          success: false,
          errors: ['An unexpected error occurred. Please try again later.'],
          supportId: undefined,
        });
      }
      router.push('/officer-registration/failure');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Officer Registration
            </h1>
            <p className="mt-2 text-base font-semibold text-gray-700">
              Details of Officer
            </p>
          </div>

          {/* ─── Registration Form ─── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">

              {/* Procuring Entity Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Procuring Entity Type <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('procuringEntityType')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.procuringEntityType && (
                  <p className="text-red-500 text-xs">{errors.procuringEntityType.message}</p>
                )}
              </div>

              {/* Designation of the Head */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Designation of the Head of the Procuring Entity <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('headDesignation')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.headDesignation && (
                  <p className="text-red-500 text-xs">{errors.headDesignation.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                {/* Country */}
                <select
                  {...register('country')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-xs">{errors.country.message}</p>
                )}

                {/* Street Line 1 */}
                <input
                  {...register('streetLine1')}
                  placeholder="Street Line 1"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white mt-2"
                />

                {/* Street Line 2 */}
                <input
                  {...register('streetLine2')}
                  placeholder="Street Line 2"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white mt-2"
                />

                {/* City */}
                <input
                  {...register('city')}
                  placeholder="City"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white mt-2"
                />

                {/* Province */}
                <input
                  {...register('province')}
                  placeholder="Province"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white mt-2"
                />

                {/* Postal Code */}
                <input
                  {...register('postalCode')}
                  placeholder="Postal Code"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white mt-2"
                />
              </div>

              {/* Personal Land Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Personal Land Phone <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('personalLandPhone')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.personalLandPhone && (
                  <p className="text-red-500 text-xs">{errors.personalLandPhone.message}</p>
                )}
              </div>

              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('officialEmail')}
                  type="email"
                  placeholder="Email"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.officialEmail && (
                  <p className="text-red-500 text-xs">{errors.officialEmail.message}</p>
                )}
              </div>

              {/* Business Registration Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Business registration Number (if applicable)
                </label>
                <input
                  {...register('businessRegistrationNumber')}
                  placeholder="Business Registration Number"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              {/* VAT Registration No */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  VAT Registration No (if applicable)
                </label>
                <input
                  {...register('vatRegistrationNumber')}
                  placeholder="VAT Registration Number"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            {/* ─── Details of Liaison Officer ─── */}
            <div className="mt-8 mb-2 text-center">
              <h2 className="text-lg font-bold text-gray-900">
                Details of Liaison Officer
              </h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8 space-y-5">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('liaisonTitle')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                >
                  <option value="">Select</option>
                  {TITLE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.liaisonTitle && (
                  <p className="text-red-500 text-xs">{errors.liaisonTitle.message}</p>
                )}
              </div>

              {/* Procurement Liaison Officer Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Liaison Officer Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('liaisonName')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.liaisonName && (
                  <p className="text-red-500 text-xs">{errors.liaisonName.message}</p>
                )}
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('liaisonDesignation')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>

              {/* NIC */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  NIC <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('liaisonNic')}
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.liaisonNic && (
                  <p className="text-red-500 text-xs">{errors.liaisonNic.message}</p>
                )}
              </div>

              {/* Mobile Phone with Country Code */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Phone with Country Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('liaisonMobile')}
                  placeholder="+94XXXXXXXXX"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.liaisonMobile && (
                  <p className="text-red-500 text-xs">{errors.liaisonMobile.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('liaisonEmail')}
                  type="email"
                  className="flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
                {errors.liaisonEmail && (
                  <p className="text-red-500 text-xs">{errors.liaisonEmail.message}</p>
                )}
              </div>
            </div>

            {/* ─── Terms & Submit ─── */}
            <div className="mt-6 px-1">
              <div className="flex items-start gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Terms of use <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('termsAccepted')}
                    id="termsAccepted"
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-500">
                    I agree with{' '}
                    <a href="#" className="text-blue-600 underline hover:text-blue-800">
                      Terms and Conditions
                    </a>{' '}
                    of the system
                  </label>
                </div>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1 ml-0">{errors.termsAccepted.message}</p>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
