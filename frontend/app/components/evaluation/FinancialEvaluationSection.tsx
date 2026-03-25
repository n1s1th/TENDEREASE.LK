// app/components/evaluation/FinancialEvaluationSection.tsx
'use client';

import React from 'react';
import { CriterionScoreRow } from './CriterionScoreRow';

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface CriterionScore {
  criterionId: string;
  score: number;
  comment: string;
  weightedScore: number;
}

interface FinancialEvaluationSectionProps {
  criteria: Criterion[];
  scores: CriterionScore[];
  totalScore: number;
  maxScore: number;
  weight: number;
  unlocked: boolean;
  technicalThresholdMet: boolean;
  onScoreUpdate: (criterionId: string, score: number, comment: string) => void;
}

export const FinancialEvaluationSection: React.FC<FinancialEvaluationSectionProps> = ({
  criteria,
  scores,
  totalScore,
  maxScore,
  weight,
  unlocked,
  technicalThresholdMet,
  onScoreUpdate,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">②</span>
          <h2 className="text-lg font-semibold text-[#333333]" style={{ fontSize: '16px' }}>
            Financial Evaluation
          </h2>
          <span className="px-3 py-1 bg-[#F5F5F5] rounded text-sm text-[#333333]" style={{ fontSize: '13px' }}>
            Weight: {weight}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          {unlocked && technicalThresholdMet ? (
            <span className="flex items-center gap-1 text-sm text-[#27AE60]" style={{ fontSize: '13px' }}>
              {/* UNLOCKED Padlock - Shackle OPEN on left side */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unlocked — Technical threshold met
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-[#EB5757]" style={{ fontSize: '13px' }}>
              {/* LOCKED Padlock - Shackle CLOSED */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Locked — Technical threshold not met
            </span>
          )}
        </div>
      </div>

      {/* Scoring Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#E0E0E0]">
              <th className="py-3 pr-4 text-left text-sm font-semibold text-[#333333]" style={{ fontSize: '13px' }}>
                Criterion
              </th>
              <th className="py-3 pr-4 text-center text-sm font-semibold text-[#333333]" style={{ fontSize: '13px' }}>
                Weight
              </th>
              <th className="py-3 pr-4 text-left text-sm font-semibold text-[#333333]" style={{ fontSize: '13px' }}>
                Score (0-100)
              </th>
              <th className="py-3 pr-4 text-left text-sm font-semibold text-[#333333]" style={{ fontSize: '13px' }}>
                Evaluator Comment
              </th>
              <th className="py-3 pr-4 text-right text-sm font-semibold text-[#333333]" style={{ fontSize: '13px' }}>
                Weighted Score
              </th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => {
              const scoreData = scores.find((s) => s.criterionId === criterion.id) || {
                criterionId: criterion.id,
                score: 0,
                comment: '',
                weightedScore: 0,
              };

              return (
                <CriterionScoreRow
                  key={criterion.id}
                  criterion={criterion}
                  score={scoreData.score}
                  comment={scoreData.comment}
                  weightedScore={scoreData.weightedScore}
                  onScoreChange={(score) => onScoreUpdate(criterion.id, score, scoreData.comment)}
                  onCommentChange={(comment) => onScoreUpdate(criterion.id, scoreData.score, comment)}
                  disabled={!unlocked || !technicalThresholdMet}
                />
              );
            })}
          </tbody>

          {/* Subtotal Row */}
          <tfoot>
            <tr className="border-t-2 border-[#E0E0E0] bg-[#F5F5F5]">
              <td className="py-4 pr-4 font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
                Financial Subtotal
              </td>
              <td className="py-4 pr-4 text-center">—</td>
              <td className="py-4 pr-4">—</td>
              <td className="py-4 pr-4">—</td>
              <td className="py-4 pr-4 text-right font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
                {totalScore.toFixed(1)} / {maxScore}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};