"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '../../../components/home/Navbar';
import { useOfficerStore } from '../../../store/officerRegistrationStore';

export default function OfficerFailurePage() {
  const { result, reset } = useOfficerStore();

  const errors = result?.errors || ['An unknown error occurred.'];
  const supportId = result?.supportId || 'ERR-REG-XXXX-XXXXXX';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

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
            Registration Unsuccessful
          </h1>

          <p className="text-base text-gray-600 mb-6">
            Your registration could not be completed due to the following issue(s):
          </p>

          {/* ─── Error Details Card ─── */}
          <div className="bg-red-50 rounded-lg p-6 mb-8 text-left max-w-lg mx-auto border border-red-100">
            <h3 className="text-red-800 font-semibold mb-2">Issue(s) found:</h3>
            <ul className="list-disc pl-5 text-red-700 text-sm space-y-2">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>

          <p className="text-base text-gray-600 mb-6">
            Please review your application and try again.
          </p>

          {/* ─── Support Reference ID ─── */}
          <div className="bg-amber-50 rounded-lg p-6 mb-8 text-left max-w-lg mx-auto border border-amber-100">
            <h3 className="text-amber-800 font-semibold mb-2">Support Reference ID</h3>
            <p className="text-amber-700 text-sm">{supportId}</p>
            <p className="text-amber-600 text-xs mt-2">
              If you continue to experience issues, please contact support with this reference ID.
            </p>
          </div>

          {/* ─── Buttons ─── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/officer-registration"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold rounded-md text-white bg-[#953002] hover:bg-[#782500] transition-colors shadow-sm min-w-[220px]"
            >
              Review &amp; Edit Application
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold rounded-md text-white bg-[#953002] hover:bg-[#782500] transition-colors shadow-sm min-w-[220px]"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
