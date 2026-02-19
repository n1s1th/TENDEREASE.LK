// app/components/evaluation/ScoreSummaryPanel.tsx
'use client';

import React from 'react';
import { ScoreGauge } from '@/components/evaluation/ScoreGauge';

interface ScoreSummaryPanelProps {
  technicalScore: number;
  financialScore: number;
  technicalWeight: number;
  financialWeight: number;
  weightedTechnicalScore: number;
  weightedFinancialScore: number;
  finalCompositeScore: number;
  threshold: number;
}

export const ScoreSummaryPanel: React.FC<ScoreSummaryPanelProps> = ({
  technicalScore,
  financialScore,
  technicalWeight,
  financialWeight,
  weightedTechnicalScore,
  weightedFinancialScore,
  finalCompositeScore,
  threshold,
}) => {
  const passed = finalCompositeScore >= threshold;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-[#333333] mb-6" style={{ fontSize: '16px' }}>
        Score Summary
      </h3>

      {/* Composite Score Gauge */}
      <div className="flex justify-center mb-6">
        <ScoreGauge score={finalCompositeScore} size="lg" label="Composite" />
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        {/* Technical Score */}
        <div className="p-4 bg-[#F5F5F5] rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#333333]" style={{ fontSize: '14px' }}>
              Technical Score
            </span>
            <span className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              {technicalScore.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-[#828282]" style={{ fontSize: '13px' }}>
            {technicalWeight * 100}% weight
          </p>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E0E0E0]">
            <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
              → Weighted (×{technicalWeight})
            </span>
            <span className="font-medium text-[#333333]" style={{ fontSize: '14px' }}>
              {weightedTechnicalScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Financial Score */}
        <div className="p-4 bg-[#F5F5F5] rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#333333]" style={{ fontSize: '14px' }}>
              Financial Score
            </span>
            <span className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              {financialScore.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-[#828282]" style={{ fontSize: '13px' }}>
            {financialWeight * 100}% weight
          </p>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#E0E0E0]">
            <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
              → Weighted (×{financialWeight})
            </span>
            <span className="font-medium text-[#333333]" style={{ fontSize: '14px' }}>
              {weightedFinancialScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Final Composite Score */}
        <div className={`p-4 rounded-md ${passed ? 'bg-[#E8F5E9]' : 'bg-[#FFEBEE]'}`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              Final Composite Score
            </span>
            <span 
              className={`font-bold text-lg ${passed ? 'text-[#27AE60]' : 'text-[#EB5757]'}`}
              style={{ fontSize: '20px' }}
            >
              {finalCompositeScore.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-[#828282] mt-2" style={{ fontSize: '13px' }}>
            Formula: (Tech × {technicalWeight}) + (Fin × {financialWeight})
          </p>
          <p className="text-xs text-[#828282]" style={{ fontSize: '13px' }}>
            Scores update live as you enter values.
          </p>
        </div>
      </div>
    </div>
  );
};