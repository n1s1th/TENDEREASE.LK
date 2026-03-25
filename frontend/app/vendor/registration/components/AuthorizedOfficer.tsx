// app/vendor/registration/components/AuthorizedOfficer.tsx
'use client';

import { Control, Controller } from 'react-hook-form';
import { VendorRegistrationFormType } from '@/lib/validation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthorizedOfficer({
  control,
  setValue
}: {
  control: Control<VendorRegistrationFormType>;
  setValue: any;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nicPassport">NIC / Passport No *</Label>
        <Controller
          name="nicPassport"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                id="nicPassport"
                placeholder="NIC or Passport Number"
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
        <Label htmlFor="name">Name *</Label>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                id="name"
                placeholder="Full Name"
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
        <Label htmlFor="designation">Designation *</Label>
        <Controller
          name="designation"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Input
                {...field}
                id="designation"
                placeholder="e.g., Director, Manager"
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
          <Label htmlFor="mobilePhone">Mobile Phone No *</Label>
          <Controller
            name="mobilePhone"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  id="mobilePhone"
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

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  id="email"
                  placeholder="Email Address"
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
    </div>
  );
}