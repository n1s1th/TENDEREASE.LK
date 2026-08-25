"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function TenderFailureContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const errorMsg = errorParam || 'An unknown error occurred during tender creation.';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center py-16">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-400 mb-6">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {/* ─── Heading ─── */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Tender Creation Failed
          </h1>

          <p className="text-base text-gray-600 mb-6">
            Your tender could not be created due to the following issue:
          </p>

          {/* ─── Error Details Card ─── */}
          <div className="bg-red-50 rounded-lg p-6 mb-8 text-left max-w-lg mx-auto border border-red-100">
            <h3 className="text-red-800 font-semibold mb-2">Issue found:</h3>
            <p className="text-red-700 text-sm">{errorMsg}</p>
          </div>

          <p className="text-base text-gray-600 mb-6">
            Please review your details and try again.
          </p>

          {/* ─── Action Buttons ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tender-creation"
              className="w-full sm:w-auto px-8 py-3 bg-[#953002] text-white font-medium rounded-md hover:bg-[#7a2702] transition-colors"
            >
              Back to Form
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3 bg-white text-[#953002] border border-[#953002] font-medium rounded-md hover:bg-orange-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TenderFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TenderFailureContent />
    </Suspense>
  );
}
