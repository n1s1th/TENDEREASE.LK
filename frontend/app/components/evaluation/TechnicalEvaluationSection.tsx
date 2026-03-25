// app/components/evaluation/TechnicalEvaluationSection.tsx
'use client';

import React from 'react';
import { ProgressBar } from '@/components/evaluation/ProgressBar';
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

interface TechnicalEvaluationSectionProps {
  criteria: Criterion[];
  scores: CriterionScore[];
  totalScore: number;
  maxScore: number;
  threshold: number;
  weight: number;
  onScoreUpdate: (criterionId: string, score: number, comment: string) => void;
}

export const TechnicalEvaluationSection: React.FC<TechnicalEvaluationSectionProps> = ({
  criteria,
  scores,
  totalScore,
  maxScore,
  threshold,
  weight,
  onScoreUpdate,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl">①</span>
          <h2 className="text-lg font-semibold text-[#333333]" style={{ fontSize: '16px' }}>
            Technical Evaluation
          </h2>
          <span className="px-3 py-1 bg-[#F5F5F5] rounded text-sm text-[#333333]" style={{ fontSize: '13px' }}>
            Weight: {weight}%
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
            Max score: {maxScore} pts
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 p-4 bg-[#F5F5F5] rounded-md">
        <ProgressBar
          current={totalScore}
          max={maxScore}
          threshold={threshold}
          showLabels={true}
          size="md"
        />
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
                />
              );
            })}
          </tbody>

          {/* Subtotal Row */}
          <tfoot>
            <tr className="border-t-2 border-[#E0E0E0] bg-[#F5F5F5]">
              <td className="py-4 pr-4 font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
                Technical Subtotal
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