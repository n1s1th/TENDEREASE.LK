// app/vendor/registration/components/DocumentUpload.tsx
'use client';

import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { VendorRegistrationForm } from '@/lib/validation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X } from 'lucide-react';

export default function DocumentUpload({
  control,
  setValue
}: {
  control: Control<VendorRegistrationForm>;
  setValue: any;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setValue('businessRegistrationDocument', selectedFile.name);
    }
  };
  
  const handleOtherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setOtherFiles(prev => [...prev, ...newFiles]);
      setValue('otherDocuments', [...otherFiles, ...newFiles].map(f => f.name));
    }
  };
  
  const removeFile = (fileName: string) => {
    setOtherFiles(prev => prev.filter(f => f.name !== fileName));
    setValue('otherDocuments', otherFiles.filter(f => f.name !== fileName).map(f => f.name));
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="businessRegistrationDocument">Business Registration Document *</Label>
        <Controller
          name="businessRegistrationDocument"
          control={control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <div 
                className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-amber-500 transition-colors"
                onClick={() => document.getElementById('businessRegInput')?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-center text-gray-600">
                  {file ? (
                    <span className="text-green-600 font-medium">{file.name}</span>
                  ) : (
                    <span>
                      Drag & drop or <span className="text-amber-600 font-medium">Browse</span> to upload
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">(PDF, JPG, PNG - Max 5MB)</p>
                <Input
                  type="file"
                  id="businessRegInput"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {fieldState.error && (
                <p className="text-xs text-red-500">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Other Documents (Ex: Company Brochures, Accreditation, Licenses, ISO Certificates)</Label>
        <div className="space-y-2">
          <div 
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-amber-500 transition-colors"
            onClick={() => document.getElementById('otherDocsInput')?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-center text-gray-600">
              {otherFiles.length > 0 ? (
                <span className="text-green-600 font-medium">{otherFiles.length} file(s) selected</span>
              ) : (
                <span>
                  Drag & drop or <span className="text-amber-600 font-medium">Browse</span> to upload
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">(Multiple files allowed - Max 10MB total)</p>
            <Input
              type="file"
              id="otherDocsInput"
              className="hidden"
              multiple
              onChange={handleOtherFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>
          
          {otherFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected Documents:</p>
              <div className="space-y-1.5">
                {otherFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="h-7 w-7 p-0 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}