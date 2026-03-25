// app/components/evaluation/SaveDraftModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const SaveDraftModal: React.FC<SaveDraftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Draft"
      type="success"
      showCloseButton={!isSaving}
    >
      <div className="space-y-4">
        <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
          Your evaluation progress will be saved as a draft. You can continue editing later.
        </p>

        <div className="p-3 bg-[#F0FFF4] border border-[#27AE60] rounded-md">
          <div className="flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#27AE60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-[#27AE60]" style={{ fontSize: '13px' }}>
              Drafts are automatically saved every 5 minutes
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-white border-2 border-[#B0B0B0] text-[#333333] rounded-md
              font-medium hover:bg-[#F5F5F5] transition-all disabled:opacity-50"
            style={{ fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-[#FFB401] text-white rounded-md font-medium
              hover:bg-[#E5A200] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '14px' }}
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>
    </Modal>
  );
};