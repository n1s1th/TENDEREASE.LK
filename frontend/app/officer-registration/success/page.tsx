"use client";

import React from 'react';
import Link from 'next/link';
import { useOfficerStore } from '../../../store/officerRegistrationStore';

export default function OfficerSuccessPage() {
  const { result } = useOfficerStore();

  const referenceId = result?.referenceId || 'OFF-XXXX-XXXXXX';

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
            You are Successfully Registered!
          </h1>
          <p className="text-base text-gray-600 mb-8">
            The officer registration has been completed successfully.
          </p>

          {/* ─── Reference ID ─── */}
          <div className="mb-8">
            <p className="text-base font-bold text-gray-900">Registration Reference ID</p>
            <p className="text-base text-gray-600 mt-1">{referenceId}</p>
          </div>

          {/* ─── What happens next? ─── */}
          <div className="bg-amber-50 rounded-lg p-6 mb-10 text-left max-w-lg mx-auto border border-amber-100">
            <h3 className="text-amber-800 font-semibold mb-2">What happens next?</h3>
            <ul className="list-disc pl-5 text-amber-700 text-sm space-y-2">
              <li>A confirmation email has been sent to the registered official email address.</li>
              <li>Our team will review and verify your registration details.</li>
              <li>This process usually takes 2-3 business days.</li>
              <li>Once approved, you may log in to the system using your registered credentials.</li>
            </ul>
          </div>

          {/* ─── Buttons ─── */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-12 py-3 text-base font-semibold rounded-md text-white bg-[#953002] hover:bg-[#782500] transition-colors shadow-sm min-w-[220px]"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
