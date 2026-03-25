// app/components/evaluation/SubmitConfirmationModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const SubmitConfirmationModal: React.FC<SubmitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Evaluation"
      type="warning"
      showCloseButton={!isSubmitting}
    >
      <div className="space-y-4">
        <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
          Are you sure you want to submit this evaluation? This action cannot be undone.
        </p>

        <div className="p-3 bg-[#FFF5F5] border border-[#EB5757] rounded-md">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-[#EB5757]" style={{ fontSize: '13px' }}>
              Once submitted, scores and comments become part of the official record
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-white border-2 border-[#B0B0B0] text-[#333333] rounded-md
              font-medium hover:bg-[#F5F5F5] transition-all disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-[#953002] text-white rounded-md font-medium
              hover:bg-[#7A2802] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '14px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
          </button>
        </div>
      </div>
    </Modal>
  );
};