// app/components/evaluation/EvaluationInfoPanel.tsx
'use client';

import React from 'react';

interface Evaluator {
  name: string;
  role: string;
  designation: string;
}

interface EvaluationInfoPanelProps {
  evaluator: Evaluator;
  bidderName: string;
  bidReference: string;
  status: 'draft' | 'in_progress' | 'submitted';
  lastSaved: string;
}

export const EvaluationInfoPanel: React.FC<EvaluationInfoPanelProps> = ({
  evaluator,
  bidderName,
  bidReference,
  status,
  lastSaved,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-[#27AE60]';
      case 'in_progress':
        return 'text-[#FFB401]';
      case 'draft':
        return 'text-[#828282]';
      default:
        return 'text-[#828282]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'in_progress':
        return 'In Progress';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 mt-6 shadow-sm">
      <h3 className="font-semibold text-[#333333] mb-4" style={{ fontSize: '16px' }}>
        EVALUATION INFO
      </h3>

      <div className="space-y-3">
        {/* Evaluator */}
        <div className="flex justify-between">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Evaluator
          </span>
          <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '14px' }}>
            {evaluator.name}
          </span>
        </div>

        {/* Role */}
        <div className="flex justify-between">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Role
          </span>
          <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '14px' }}>
            {evaluator.designation}
          </span>
        </div>

        {/* Bidder */}
        <div className="flex justify-between">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Bidder
          </span>
          <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '14px' }}>
            {bidderName} ({bidReference})
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Status
          </span>
          <span className={`text-sm font-medium ${getStatusColor(status)}`} style={{ fontSize: '14px' }}>
            {getStatusLabel(status)}
          </span>
        </div>

        {/* Last Saved */}
        <div className="flex justify-between">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Last Saved
          </span>
          <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '14px' }}>
            {lastSaved}
          </span>
        </div>
      </div>
    </div>
  );
};