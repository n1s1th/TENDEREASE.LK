// app/components/evaluation/EvaluationActions.tsx
'use client';

import React from 'react';

interface EvaluationActionsProps {
  onSaveDraft: () => void;
  onSubmitEvaluation: () => void;
  onDownloadScoreSheet: () => void;
  isSubmitting?: boolean;
  canSubmit?: boolean;
}

export const EvaluationActions: React.FC<EvaluationActionsProps> = ({
  onSaveDraft,
  onSubmitEvaluation,
  onDownloadScoreSheet,
  isSubmitting = false,
  canSubmit = true,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mt-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Save Draft Button */}
        <button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-white border-2 border-[#953002] text-[#953002] rounded-md
            font-medium hover:bg-[#FFF8E6] hover:border-[#FFB401] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '14px' }}
        >
          Save Draft
        </button>

        {/* Submit Evaluation Button */}
        <button
          onClick={onSubmitEvaluation}
          disabled={isSubmitting || !canSubmit}
          className="w-full px-6 py-3 bg-[#953002] text-white rounded-md font-medium
            hover:bg-[#7A2802] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '14px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
        </button>

        {/* Download Score Sheet Button */}
        <button
          onClick={onDownloadScoreSheet}
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-white border-2 border-dashed border-[#B0B0B0] text-[#828282] rounded-md
            font-medium hover:border-[#FFB401] hover:text-[#953002] transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: '14px' }}
        >
          Download Score Sheet
        </button>

        {/* Info Text */}
        <p className="text-xs text-[#828282] text-center" style={{ fontSize: '12px', lineHeight: '1.4' }}>
          Once submitted, inputs become read-only until unlocked by the committee chair.
        </p>
      </div>
    </div>
  );
};