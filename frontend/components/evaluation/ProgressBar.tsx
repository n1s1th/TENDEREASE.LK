// components/evaluation/ProgressBar.tsx
'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  threshold?: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  threshold,
  showLabels = true,
  size = 'md',
}) => {
  const percentage = (current / max) * 100;
  const passed = threshold ? current >= threshold : true;

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[size];

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '14px' }}>
            {current} / {max}
          </span>
          {threshold && (
            <span 
              className={`text-sm font-medium ${
                passed ? 'text-[#27AE60]' : 'text-[#EB5757]'
              }`}
              style={{ fontSize: '14px' }}
            >
              {passed ? '✓ PASS' : '✗ FAIL'} {threshold && `(Threshold: ${threshold})`}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#E0E0E0] rounded-full ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            passed ? 'bg-[#953002]' : 'bg-[#EB5757]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};