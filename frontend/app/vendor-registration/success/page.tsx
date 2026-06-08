import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-16 text-center bg-white p-10 rounded-xl shadow-sm border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Registration Submitted Successfully!</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Thank you for registering with TenderEase.lk. Your vendor profile is currently under review by our administration team.
        </p>
        
        <div className="bg-amber-50 rounded-lg p-6 mb-8 text-left max-w-lg mx-auto border border-amber-100">
          <h3 className="text-amber-800 font-semibold mb-2">What happens next?</h3>
          <ul className="list-disc pl-5 text-amber-700 text-sm space-y-2">
            <li>Our team will verify your business registration and uploaded documents.</li>
            <li>This process usually takes 2-3 business days.</li>
            <li>Once approved, you will receive an email verification link to activate your account and set up your password.</li>
          </ul>
        </div>

        <Link 
          href="/" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#953002] hover:bg-amber-800 transition-colors shadow-sm"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
