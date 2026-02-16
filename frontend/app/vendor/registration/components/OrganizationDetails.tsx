// app/vendor/registration/components/OrganizationDetails.tsx
'use client';

import { Control, Controller } from 'react-hook-form';
import { VendorRegistrationForm } from '@/lib/validation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OrganizationDetails({
  control,
  setValue
}: {
  control: Control<VendorRegistrationForm>;
  setValue: any;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessRegistrationAuthority">Business Registration Authority *</Label>
          <Controller
            name="businessRegistrationAuthority"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="businessRegistrationAuthority">
                    <SelectValue placeholder="Select authority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CIDA">CIDA (Construction Industry Development Authority)</SelectItem>
                    <SelectItem value="BOI">BOI (Board of Investment)</SelectItem>
                    <SelectItem value="RDA">RDA (Rural Development Authority)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name *</Label>
          <Controller
            name="businessName"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="businessName" 
                  placeholder="Enter business name" 
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Controller
            name="country"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessRegistrationNo">Business Registration No *</Label>
          <Controller
            name="businessRegistrationNo"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="businessRegistrationNo" 
                  placeholder="Enter registration number" 
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="typeOfOrganization">Type of Organization *</Label>
        <Controller
          name="typeOfOrganization"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="typeOfOrganization">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private Limited Company</SelectItem>
                  <SelectItem value="Public">Public Limited Company</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="SoleProprietor">Sole Proprietor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="registeredAddress">Registered Address *</Label>
        <Controller
          name="registeredAddress"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input 
                {...field} 
                id="registeredAddress" 
                placeholder="Street address" 
                className={fieldState.error ? 'border-red-500' : ''}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Controller
            name="city"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="city" 
                  placeholder="Enter city" 
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="province">Province *</Label>
          <Controller
            name="province"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="province" 
                  placeholder="Enter province" 
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Controller
            name="website"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="website" 
                  placeholder="https://www.yoursite.com" 
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="officialEmail">Official Email *</Label>
          <Controller
            name="officialEmail"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input 
                  {...field} 
                  id="officialEmail" 
                  placeholder="Official Email" 
                  type="email"
                  className={fieldState.error ? 'border-red-500' : ''}
                />
                {fieldState.error && (
                  <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                )}
              </>
            )}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="officialTelephone">Official Telephone No *</Label>
        <Controller
          name="officialTelephone"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input 
                {...field} 
                id="officialTelephone" 
                placeholder="+94 XX XXX XXXX" 
                className={fieldState.error ? 'border-red-500' : ''}
              />
              {fieldState.error && (
                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}