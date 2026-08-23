import React from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex-1 bg-gray-50 flex flex-col justify-center items-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Registration Completed Successfully!</h2>
        <p className="text-base text-gray-600 mb-6 max-w-xl mx-auto">
          Thank you for registering with TenderEase.lk. Your vendor profile has been successfully registered and approved.
        </p>
        
        <div className="bg-amber-50 rounded-lg p-5 mb-6 text-left max-w-md mx-auto border border-amber-100">
          <h3 className="text-amber-800 font-semibold mb-1 text-sm">What you can do now:</h3>
          <ul className="list-disc pl-5 text-amber-700 text-xs space-y-1">
            <li>Access your centralized vendor dashboard to view active government tenders.</li>
            <li>Submit competitive bids for active procurement projects online.</li>
            <li>Track your bidding history, recommendations, awards, and payments in real time.</li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#953002] hover:bg-amber-800 transition-colors shadow-sm"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/" 
            className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
