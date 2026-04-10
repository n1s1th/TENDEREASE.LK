"use client";

import React, { useEffect } from 'react';
import Step1Organization from './steps/Step1Organization';
import Step2Officer from './steps/Step2Officer';
import Step3Documents from './steps/Step3Documents';
import Step4Review from './steps/Step4Review';
import { useVendorStore } from '../../store/vendorRegistrationStore';
import Navbar from '../../components/home/Navbar';

export default function VendorRegistrationPage() {
  const { currentStep, setStep } = useVendorStore();

  useEffect(() => {
    // Start at step 1 on mount
    setStep(1);
  }, [setStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Organization />;
      case 2: return <Step2Officer />;
      case 3: return <Step3Documents />;
      case 4: return <Step4Review />;
      default: return <Step1Organization />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Vendor Registration
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              Join TenderEase.lk to discover and bid on government and private sector given opportunities.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center relative w-1/4">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm z-10 
                      ${currentStep === step 
                        ? 'bg-[#953002] text-white shadow-md ring-4 ring-amber-100' 
                        : currentStep > step 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <div className={`mt-3 text-xs font-medium uppercase tracking-wide
                    ${currentStep === step ? 'text-[#953002]' : currentStep > step ? 'text-amber-700' : 'text-gray-400'}
                  `}>
                    {step === 1 && 'Organization'}
                    {step === 2 && 'Officer'}
                    {step === 3 && 'Documents'}
                    {step === 4 && 'Review'}
                  </div>

                  {step < 4 && (
                    <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-200 -z-0">
                       <div 
                         className="h-full bg-amber-600 transition-all duration-300"
                         style={{ width: currentStep > step ? '100%' : '0%' }}
                       />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Render Active Step */}
          <div className="transition-all duration-500 ease-in-out">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
}
