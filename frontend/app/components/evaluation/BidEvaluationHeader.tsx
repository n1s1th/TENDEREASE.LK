// app/components/evaluation/BidEvaluationHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface BidEvaluationHeaderProps {
  tenderId: string;
  tenderTitle: string;
  category: string;
  software: string;
  technicalWeight: number;
  financialWeight: number;
  dueDate: string;
  bidsReceived: number;
  threshold: number;
}

export const BidEvaluationHeader: React.FC<BidEvaluationHeaderProps> = ({
  tenderId,
  tenderTitle,
  category,
  software,
  technicalWeight,
  financialWeight,
  dueDate,
  bidsReceived,
  threshold,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      {/* Breadcrumb */}
      <nav className="mb-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/dashboard" className="text-[#828282] hover:text-[#953002]">
              Committee Dashboard
            </Link>
          </li>
          <li className="text-[#B0B0B0]">›</li>
          <li>
            <Link href={`/tenders/${tenderId}`} className="text-[#828282] hover:text-[#953002]">
              {tenderId} — {tenderTitle}
            </Link>
          </li>
          <li className="text-[#B0B0B0]">›</li>
          <li className="text-[#333333] font-medium">Bid Evaluation</li>
        </ol>
      </nav>

      {/* Title Section */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Inter' }}>
            Unified Bid Evaluation
          </h1>
          <p className="text-[#828282] mt-1" style={{ fontSize: '14px' }}>
            {tenderId} · {tenderTitle} · {category} · {software} · Weighting: Technical {technicalWeight}% / Financial {financialWeight}%
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-[#F5F5F5] rounded-md border border-[#E0E0E0]">
            <span className="text-sm text-[#333333]" style={{ fontSize: '13px' }}>
              Due: {dueDate}
            </span>
          </div>
          <div className="px-4 py-2 bg-[#F5F5F5] rounded-md border border-[#E0E0E0]">
            <span className="text-sm text-[#333333]" style={{ fontSize: '13px' }}>
              {bidsReceived} Bids Received
            </span>
          </div>
          <div className="px-4 py-2 bg-[#F5F5F5] rounded-md border border-[#E0E0E0]">
            <span className="text-sm text-[#333333]" style={{ fontSize: '13px' }}>
              Threshold: {threshold} / 100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};