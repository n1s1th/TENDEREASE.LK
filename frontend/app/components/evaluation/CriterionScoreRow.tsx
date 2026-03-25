// app/components/evaluation/CriterionScoreRow.tsx
'use client';

import React from 'react';
import { ScoreInput } from '@/components/evaluation/ScoreInput';

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
}

interface CriterionScoreRowProps {
  criterion: Criterion;
  score: number;
  comment: string;
  maxScore?: number;
  weightedScore?: number;
  onScoreChange: (score: number) => void;
  onCommentChange: (comment: string) => void;
  disabled?: boolean;
}

export const CriterionScoreRow: React.FC<CriterionScoreRowProps> = ({
  criterion,
  score,
  comment,
  maxScore = 100,
  weightedScore,
  onScoreChange,
  onCommentChange,
  disabled = false,
}) => {
  return (
    <tr className="border-b border-[#E0E0E0]">
      {/* Criterion Name & Description */}
      <td className="py-4 pr-4" style={{ width: '25%' }}>
        <p className="font-medium text-[#333333]" style={{ fontSize: '14px' }}>
          {criterion.name}
        </p>
        <p className="text-[#828282] mt-1" style={{ fontSize: '13px' }}>
          {criterion.description}
        </p>
      </td>

      {/* Weight */}
      <td className="py-4 pr-4 text-center" style={{ width: '10%' }}>
        <span className="px-3 py-1 bg-[#F5F5F5] rounded text-sm text-[#333333]" style={{ fontSize: '13px' }}>
          {criterion.weight}%
        </span>
      </td>

      {/* Score Input */}
      <td className="py-4 pr-4" style={{ width: '15%' }}>
        <ScoreInput
          value={score}
          maxValue={maxScore}
          onChange={onScoreChange}
          disabled={disabled}
          showMax={true}
        />
      </td>

      {/* Comment Input */}
      <td className="py-4 pr-4" style={{ width: '35%' }}>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter evaluator comment..."
          rows={2}
          className="w-full px-3 py-2 border border-[#B0B0B0] rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-[#FFB401] focus:border-transparent
            disabled:bg-[#F5F5F5] disabled:cursor-not-allowed
            text-[#333333] placeholder-[#828282]"
          style={{ fontSize: '14px', fontFamily: 'Inter', lineHeight: '1.4' }}
        />
      </td>

      {/* Weighted Score */}
      <td className="py-4 pr-4 text-right" style={{ width: '15%' }}>
        <span className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
          {weightedScore !== undefined ? weightedScore.toFixed(2) : '-'}
        </span>
      </td>
    </tr>
  );
};