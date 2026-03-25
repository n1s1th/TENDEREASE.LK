// app/components/evaluation/LowScoreWarningModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface LowScoreWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (justification: string) => void;
  criterionName: string;
  score: number;
}

export const LowScoreWarningModal: React.FC<LowScoreWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  criterionName,
  score,
}) => {
  const [justification, setJustification] = React.useState('');

  const handleSubmit = () => {
    if (justification.trim()) {
      onConfirm(justification);
      setJustification('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Low Score Warning"
      type="warning"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#E2B93B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              You&apos;ve entered a score of{" "}
              <span className="font-bold text-[#EB5757]">{score}</span>
              {" "}for{" "}
              <span className="font-semibold">&quot;{criterionName}&quot;</span>
              . Scores below 50 require justification.
            </p>
          </div>
        </div>

        {/* Justification Text Area */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2" style={{ fontSize: '14px' }}>
            Justification (Required)
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Please provide detailed justification for this low score..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#FFB401] focus:border-transparent
              text-[#333333] placeholder-[#828282]"
            style={{ fontSize: '14px', fontFamily: 'Inter', lineHeight: '1.4' }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#828282]" style={{ fontSize: '12px' }}>
              Minimum 20 characters
            </span>
            <span className={`text-xs ${justification.length >= 20 ? 'text-[#27AE60]' : 'text-[#828282]'}`} style={{ fontSize: '12px' }}>
              {justification.length} characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border-2 border-[#B0B0B0] text-[#333333] rounded-md
              font-medium hover:bg-[#F5F5F5] transition-all"
            style={{ fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={justification.length < 20}
            className="flex-1 px-4 py-3 bg-[#FFB401] text-white rounded-md font-medium
              hover:bg-[#E5A200] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '14px' }}
          >
            Add Justification
          </button>
        </div>
      </div>
    </Modal>
  );
};