// components/evaluation/ScoreGauge.tsx
'use client';

import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  maxScore = 100,
  size = 'md',
  label,
}) => {
  const percentage = (score / maxScore) * 100;
  const radius = size === 'lg' ? 60 : size === 'md' ? 40 : 30;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const dimensions = {
    sm: { width: 80, height: 80, fontSize: '18px' },
    md: { width: 120, height: 120, fontSize: '24px' },
    lg: { width: 160, height: 160, fontSize: '32px' },
  }[size];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r={radius}
            stroke="#953002"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold text-[#953002]"
            style={{ fontSize: dimensions.fontSize }}
          >
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      {label && (
        <p className="mt-2 text-sm text-[#828282]" style={{ fontSize: '14px' }}>
          {label}
        </p>
      )}
    </div>
  );
};