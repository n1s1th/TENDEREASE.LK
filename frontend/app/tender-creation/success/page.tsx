"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function TenderSuccessContent() {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get('ref') || 'TR-XXXX-XXXXXX';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center py-16">
          {/* ─── Green Check Icon ─── */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-500 mb-6">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* ─── Heading ─── */}
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
            Tender Created Successfully!
          </h1>
          <p className="text-base text-gray-600 mb-8">
            Your tender has been submitted for approval.
          </p>

          {/* ─── Reference ID ─── */}
          <div className="mb-8">
            <p className="text-base font-bold text-gray-900">Tender Reference ID</p>
            <p className="text-base text-gray-600 mt-1">{referenceId}</p>
          </div>

          {/* ─── What happens next? ─── */}
          <div className="bg-amber-50 rounded-lg p-6 mb-10 text-left max-w-lg mx-auto border border-amber-100">
            <h3 className="text-amber-800 font-semibold mb-2">What happens next?</h3>
            <ul className="list-disc pl-5 text-amber-700 text-sm space-y-2">
              <li>Your tender has been forwarded to the Chief Accounting Officer (CAO) for approval.</li>
              <li>You can track its status in your dashboard under the "Pending" tab.</li>
              <li>Once approved, it will be automatically published.</li>
            </ul>
          </div>

          {/* ─── Action Buttons ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3 bg-[#953002] text-white font-medium rounded-md hover:bg-[#7a2702] transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/tender-creation"
              className="w-full sm:w-auto px-8 py-3 bg-white text-[#953002] border border-[#953002] font-medium rounded-md hover:bg-orange-50 transition-colors"
            >
              Create Another
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TenderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TenderSuccessContent />
    </Suspense>
  );
}
