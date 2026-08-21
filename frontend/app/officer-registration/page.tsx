"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { officerRegistrationSchema, type OfficerRegistrationFormData } from '../../lib/validations/officerSchema';
import { registerOfficer, extractErrors, extractSupportId } from '../../lib/api/officerApi';
import { useOfficerStore, EMPTY_DRAFT, type OfficerFormDraft } from '../../store/officerRegistrationStore';
import axios from 'axios';

// ────────────────────────────────────────────────────────
//  Constants
// ────────────────────────────────────────────────────────

const COUNTRIES = [
  'Sri Lanka', 'India', 'United Kingdom', 'United States', 'Australia',
  'Canada', 'Singapore', 'Japan', 'Germany', 'Other'
];

const TITLE_OPTIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev'];

const PROCURING_ENTITY_TYPES = ['Government Institution', 'Provincial Council'];

const PROVINCIAL_COUNCILS = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'Northern Province',
  'Eastern Province',
  'North Western Province',
  'North Central Province',
  'Uva Province',
  'Sabaragamuwa Province',
];

/** Procuring Entity Level options when "Government Institution" is selected */
const GOV_ENTITY_LEVELS = [
  'Ministry',
  'Department',
  'Special Spending Unit',
  'State Owned Enterprise',
];

/** Procuring Entity Level options when "Provincial Council" is selected */
const PROV_ENTITY_LEVELS = [
  'Provincial Special Spending Unit',
  'Provincial Ministry',
  'Provincial Department',
  'Local Authority',
  'Provincial Statutory Enterprise',
];

const TERMS_TEXT = `The officer appointed by the Head of the Organization (Ministry, Department, Special Spending Units or the State Own Enterprise) as the Liaison Officer (LO) to coordinate with Ministry of Finance on e-Procurement activities shall be responsible to enter the correct information to the Government's e-Procurement System (TenderEase). The TenderEase system and Ministry of Finance shall not be responsible for any consequences might take place on inputting wrong, fraudulent or misleading information to the TenderEase system by the LO or/ and the officer(if any) to whom the LO delegates his due functions on managing affairs with TenderEase. However, Head of the Organization is accountable for overall functions in the e-GP system.

LO shall ensure among others to update the Procurement Plan published by the Procurement Entity with most updated procurement-related information into the TenderEase system before floating a bid, using the TenderEase system. Also, LO shall be responsible to upload complete and accurate information to the TenderEase system in the process of registration of the Procurement Entity and thereafter the use of the TenderEase system for public procurement processes. LO shall be responsible to maintain the confidentiality of the information inputted by the LO or/and the officer (if any) to whom the LO delegates his due functions on managing affairs with TenderEase.`;

// ────────────────────────────────────────────────────────
//  Component
// ────────────────────────────────────────────────────────

export default function OfficerRegistrationPage() {
  const router = useRouter();
  const { setResult, setSubmitting, formDraft, setFormDraft, clearDraft } = useOfficerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<OfficerRegistrationFormData>({
    resolver: zodResolver(officerRegistrationSchema),
    defaultValues: EMPTY_DRAFT,
  });

  useEffect(() => {
    if (formDraft && formDraft !== EMPTY_DRAFT) {
      resetForm(formDraft);
    }
    setHydrated(true);
  }, []);

  // ── Save draft on field change via subscription (avoids infinite re-render) ──
  useEffect(() => {
    if (!hydrated) return;
    const subscription = watch((values) => {
      setFormDraft(values as unknown as OfficerFormDraft);
    });
    return () => subscription.unsubscribe();
  }, [hydrated, watch, setFormDraft]);

  // ── Watched field for conditional rendering ──
  const entityType = watch('procuringEntityType');

  const entityLevelOptions =
    entityType === 'Provincial Council'
      ? PROV_ENTITY_LEVELS
      : entityType === 'Government Institution'
        ? GOV_ENTITY_LEVELS
        : [];

  // ── Submit handler ──
  const onSubmit = async (data: OfficerRegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitting(true);

    try {
      if (user?.id) {
        data.keycloakUserId = user.id;
      }

      const response = await registerOfficer(data);
      setResult({
        success: true,
        referenceId: response.data.referenceId,
      });
      setOfficerRegistration('PENDING', response.data.referenceId);
      clearDraft();
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

  // common input class
  const inputCls = 'flex border border-gray-300 rounded-md px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Officer Registration
            </h1>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Register your organization and liaison officer to manage government procurement processes on TenderEase.lk.
            </p>
          </div>

          {/* ─── Details of Procuring Entity ─── */}
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h2 className="text-xl font-bold text-[#953002] uppercase tracking-wide px-2">
              Details of Procuring Entity
            </h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* ─── Registration Form ─── */}
          <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
            // Scroll to the first error field so the user can see it
            const firstErrorKey = Object.keys(validationErrors)[0];
            if (firstErrorKey) {
              const el = document.querySelector(`[name="${firstErrorKey}"]`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (el as HTMLElement).focus?.();
              }
            }
          })} className="space-y-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              {/* ── Procuring Entity Type ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Procuring Entity Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('procuringEntityType')}
                  className={inputCls}
                >
                  <option value="">Select</option>
                  {PROCURING_ENTITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.procuringEntityType && (
                  <p className="text-red-500 text-xs">{errors.procuringEntityType.message}</p>
                )}
              </div>

              {/* ── Provincial Councils (only when Provincial Council is selected) ── */}
              {entityType === 'Provincial Council' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Provincial Councils <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('provincialCouncil')}
                    className={inputCls}
                  >
                    <option value="">Select</option>
                    {PROVINCIAL_COUNCILS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.provincialCouncil && (
                    <p className="text-red-500 text-xs">{errors.provincialCouncil.message}</p>
                  )}
                </div>
              )}

              {/* ── Procuring Entity Level (shown for both types once type is selected) ── */}
              {entityType && entityLevelOptions.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Procuring Entity Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('procuringEntityLevel')}
                    className={inputCls}
                  >
                    <option value="">Select</option>
                    {entityLevelOptions.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  {errors.procuringEntityLevel && (
                    <p className="text-red-500 text-xs">{errors.procuringEntityLevel.message}</p>
                  )}
                </div>
              )}

              {/* ── Designation of the Head ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Designation of the Head of the Procuring Entity <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('headDesignation')}
                  className={inputCls}
                />
                {errors.headDesignation && (
                  <p className="text-red-500 text-xs">{errors.headDesignation.message}</p>
                )}
              </div>

              {/* ── Address ── */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div>
                    <select {...register('country')} className={inputCls}>
                      <option value="">Country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                  </div>

                  <div>
                    <input {...register('streetLine1')} placeholder="Street Line 1" className={inputCls} />
                    {errors.streetLine1 && <p className="text-red-500 text-xs mt-1">{errors.streetLine1.message}</p>}
                  </div>

                  <div>
                    <input {...register('streetLine2')} placeholder="Street Line 2" className={inputCls} />
                  </div>

                  <div>
                    <input {...register('city')} placeholder="City" className={inputCls} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <input {...register('province')} placeholder="Province" className={inputCls} />
                  </div>

                  <div>
                    <input {...register('postalCode')} placeholder="Postal Code" className={inputCls} />
                  </div>
                </div>
              </div>

              {/* ── Personal Land Phone ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Personal Land Phone <span className="text-red-500">*</span>
                </label>
                <input {...register('personalLandPhone')} className={inputCls} />
                {errors.personalLandPhone && <p className="text-red-500 text-xs">{errors.personalLandPhone.message}</p>}
              </div>

              {/* ── Official Email ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <input {...register('officialEmail')} type="email" placeholder="Email" className={inputCls} />
                {errors.officialEmail && <p className="text-red-500 text-xs">{errors.officialEmail.message}</p>}
              </div>

              {/* ── Business Registration Number ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Business registration Number (if applicable)
                </label>
                <input {...register('businessRegistrationNumber')} placeholder="PV 12345" className={inputCls} />
                {errors.businessRegistrationNumber && (
                  <p className="text-red-500 text-xs">{errors.businessRegistrationNumber.message}</p>
                )}
              </div>

              {/* ── VAT Registration No ── */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  VAT Registration No (if applicable)
                </label>
                <input {...register('vatRegistrationNumber')} placeholder="1234567897000" className={inputCls} />
                {errors.vatRegistrationNumber ? (
                  <p className="text-red-500 text-xs">{errors.vatRegistrationNumber.message}</p>
                ) : (
                  <p className="text-gray-400 text-[11px]">Format: 13 digits ending with 7000</p>
                )}
              </div>
            </div>

            {/* ─── Details of Liaison Officer ─── */}
            <div className="mt-16 mb-6 flex items-center justify-center gap-4">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h2 className="text-xl font-bold text-[#953002] uppercase tracking-wide px-2">
                Details of Liaison Officer
              </h2>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <select {...register('liaisonTitle')} className={inputCls}>
                  <option value="">Select</option>
                  {TITLE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.liaisonTitle && <p className="text-red-500 text-xs">{errors.liaisonTitle.message}</p>}
              </div>

              {/* Procurement Liaison Officer Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Procurement Liaison Officer Name <span className="text-red-500">*</span>
                </label>
                <input {...register('liaisonName')} className={inputCls} />
                {errors.liaisonName && <p className="text-red-500 text-xs">{errors.liaisonName.message}</p>}
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input {...register('liaisonDesignation')} className={inputCls} />
                {errors.liaisonDesignation && <p className="text-red-500 text-xs mt-1">{errors.liaisonDesignation.message}</p>}
              </div>

              {/* NIC */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  NIC <span className="text-red-500">*</span>
                </label>
                <input {...register('liaisonNic')} className={inputCls} />
                {errors.liaisonNic && <p className="text-red-500 text-xs">{errors.liaisonNic.message}</p>}
              </div>

              {/* Mobile Phone with Country Code */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Phone with Country Code <span className="text-red-500">*</span>
                </label>
                <input {...register('liaisonMobile')} placeholder="+94XXXXXXXXX" className={inputCls} />
                {errors.liaisonMobile && <p className="text-red-500 text-xs">{errors.liaisonMobile.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input {...register('liaisonEmail')} type="email" className={inputCls} />
                {errors.liaisonEmail && <p className="text-red-500 text-xs">{errors.liaisonEmail.message}</p>}
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
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Terms and Conditions
                    </button>{' '}
                    of the system
                  </label>
                </div>
              </div>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1 ml-0">{errors.termsAccepted.message}</p>
              )}
            </div>

            <div className="mt-6">
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <strong>Please fix the following errors before submitting:</strong>
                  <ul className="mt-1 ml-4 list-disc">
                    {Object.entries(errors).map(([key, err]) => (
                      <li key={key}>{(err as any)?.message || `${key} is invalid`}</li>
                    ))}
                  </ul>
                </div>
              )}
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

      {/* ─── Terms and Conditions Modal ─── */}
      {showTermsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {TERMS_TEXT}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
