// app/vendor/registration/components/TermsAgreement.tsx
'use client';

import { Control, Controller } from 'react-hook-form';
import { VendorRegistrationForm } from '@/lib/validation';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function TermsAgreement({
  control
}: {
  control: Control<VendorRegistrationForm>;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-gray-900">Agreements to Terms and Conditions</h3>
        <p className="text-sm text-gray-600">
          Please review and accept the following agreements to proceed with registration:
        </p>
      </div>
      
      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-start space-x-3">
          <Controller
            name="termsOfUse"
            control={control}
            render={({ field }) => (
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange}
                id="termsOfUse"
                className="mt-1"
              />
            )}
          />
          <div className="flex-1">
            <Label 
              htmlFor="termsOfUse" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I agree to the Terms and Conditions of using the system
            </Label>
            <p className="text-xs text-gray-500 mt-1 pl-6">
              1. Read "Terms and Conditions" of using system (available in Help section)
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <Controller
            name="vendorAgreement"
            control={control}
            render={({ field }) => (
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange}
                id="vendorAgreement"
                className="mt-1"
              />
            )}
          />
          <div className="flex-1">
            <Label 
              htmlFor="vendorAgreement" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              I agree to the Vendor/Supplier Agreement
            </Label>
            <p className="text-xs text-gray-500 mt-1 pl-6">
              2. Vendor/supplier agreement (available in Help section)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}