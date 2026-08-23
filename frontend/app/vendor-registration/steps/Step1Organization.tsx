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

const SRI_LANKA_PROVINCES = [
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

const SRI_LANKA_CITIES: { [key: string]: string[] } = {
  'Western Province': ['Colombo', 'Gampaha', 'Kalutara', 'Negombo', 'Dehiwala-Mount Lavinia', 'Moratuwa', 'Sri Jayawardenepura Kotte', 'Battaramulla', 'Kotte', 'Malabe', 'Nugegoda', 'Maharagama', 'Kaduwela'],
  'Central Province': ['Kandy', 'Matale', 'Nuwara Eliya', 'Gampola', 'Dambulla', 'Hatton', 'Kundasale'],
  'Southern Province': ['Galle', 'Matara', 'Hambantota', 'Tangalle', 'Hikkaduwa', 'Ambalangoda', 'Weligama'],
  'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Point Pedro'],
  'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara', 'Kalmunai', 'Samanthurai'],
  'North Western Province': ['Kurunegala', 'Chilaw', 'Puttalam', 'Kuliyapitiya', 'Wariyapola'],
  'North Central Province': ['Anuradhapura', 'Polonnaruwa', 'Medawachchiya'],
  'Uva Province': ['Badulla', 'Monaragala', 'Bandarawela', 'Diyatalawa', 'Hali-Ela'],
  'Sabaragamuwa Province': ['Ratnapura', 'Kegalle', 'Balangoda', 'Mawanella', 'Embilipitiya'],
};

export default function Step1Organization() {
  const { organizationData, setOrganizationData, nextStep, setVerified, isVerified, verifiedCompanyName } = useVendorStore();
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const inputCls = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-75";

  const getInitialPhoneAndPrefix = (phone: string, country: string) => {
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

  const initialCountry = organizationData?.country || 'Sri Lanka';
  const initialPhone = organizationData?.officialTelephone 
    ? getInitialPhoneAndPrefix(organizationData.officialTelephone, initialCountry)
    : '';

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<OrgData>({
    resolver: zodResolver(organizationSchema),
    mode: 'onChange',
    defaultValues: {
      businessName: organizationData?.businessName || '',
      registrationAuthority: organizationData?.registrationAuthority || 'Department of the Registrar of Companies',
      registrationNumber: organizationData?.registrationNumber || '',
      organizationType: organizationData?.organizationType || '',
      country: initialCountry,
      registrationAddress: organizationData?.registrationAddress || '',
      city: organizationData?.city || '',
      province: organizationData?.province || '',
      website: organizationData?.website || '',
      officialEmail: organizationData?.officialEmail || '',
      officialTelephone: initialPhone,
      departments: organizationData?.departments || []
    }
  });

  const selectedCountry = watch('country');
  const selectedProvince = watch('province');
  const registrationNumber = watch('registrationNumber');

  const [verifiedNum, setVerifiedNum] = useState<string | null>(organizationData?.registrationNumber || null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // If selectedCountry changes (after first render), reset city and province fields
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    setValue('province', '');
    setValue('city', '');
  }, [selectedCountry, setValue]);

  // Autofill and lock the businessName if verifiedCompanyName is present/updated
  useEffect(() => {
    if (isVerified && verifiedCompanyName) {
      setValue('businessName', verifiedCompanyName);
    }
  }, [isVerified, verifiedCompanyName, setValue]);

  // Reset verification if user changes the registration number
  useEffect(() => {
    if (isVerified && registrationNumber !== verifiedNum) {
      setVerified(false);
    }
  }, [registrationNumber, isVerified, verifiedNum, setVerified]);

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
        setVerifiedNum(certificateNo);
        setValue('businessName', result.companyName);
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

    // Prepend the country prefix if it's not already present in the string
    const prefix = COUNTRY_CODES[data.country]?.code || '';
    const updatedData = { ...data };
    if (prefix && !updatedData.officialTelephone.startsWith(prefix)) {
      updatedData.officialTelephone = `${prefix}${updatedData.officialTelephone}`;
    }

    setOrganizationData(updatedData);
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
              className={inputCls}
              placeholder="e.g. PV00309389"
            />
            <button 
              type="button" 
              onClick={handleVerify}
              disabled={verifying}
              className="h-10 px-4 bg-[#953002] text-white rounded-md text-sm font-semibold hover:bg-amber-800 disabled:opacity-50 min-w-[100px] transition-colors"
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
          <input 
            {...register('businessName')} 
            readOnly={isVerified}
            className={`${inputCls} ${isVerified ? 'bg-gray-100 cursor-not-allowed opacity-75 focus:ring-0 focus:border-gray-300' : ''}`} 
          />
          {errors.businessName && <p className="text-red-500 text-xs">{errors.businessName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Registration Authority *</label>
          <input {...register('registrationAuthority')} className={inputCls} />
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
          <select {...register('organizationType')} className={inputCls}>
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
          <select {...register('country')} className={inputCls}>
            {Object.keys(COUNTRY_CODES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.country && <p className="text-red-500 text-xs">{errors.country.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Registration Address *</label>
          <input {...register('registrationAddress')} className={inputCls} />
          {errors.registrationAddress && <p className="text-red-500 text-xs">{errors.registrationAddress.message}</p>}
        </div>

        {selectedCountry === 'Sri Lanka' ? (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Province *</label>
              <select {...register('province')} className={inputCls}>
                <option value="">Select Province...</option>
                {SRI_LANKA_PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.province && <p className="text-red-500 text-xs">{errors.province.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <select {...register('city')} className={inputCls} disabled={!selectedProvince}>
                <option value="">Select City...</option>
                {selectedProvince && SRI_LANKA_CITIES[selectedProvince]?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Province *</label>
              <input {...register('province')} placeholder="e.g. State / Region" className={inputCls} />
              {errors.province && <p className="text-red-500 text-xs">{errors.province.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input {...register('city')} placeholder="e.g. City Name" className={inputCls} />
              {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Official Email *</label>
          <input 
            {...register('officialEmail')} 
            type="email" 
            readOnly={!!user?.email} 
            className={inputCls} 
          />
          {errors.officialEmail && <p className="text-red-500 text-xs">{errors.officialEmail.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Official Telephone *</label>
          <div className="flex rounded-md shadow-sm">
            {COUNTRY_CODES[selectedCountry]?.code && (
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none font-medium h-10">
                {COUNTRY_CODES[selectedCountry].code}
              </span>
            )}
            <input 
              {...register('officialTelephone')} 
              className={`${inputCls} ${COUNTRY_CODES[selectedCountry]?.code ? 'rounded-l-none border-l-0' : ''}`}
            />
          </div>
          {errors.officialTelephone && <p className="text-red-500 text-xs">{errors.officialTelephone.message}</p>}
        </div>

        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input {...register('website')} type="url" placeholder="https://" className={inputCls} />
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
