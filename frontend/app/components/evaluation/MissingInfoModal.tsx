// app/components/evaluation/MissingInfoModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface MissingItem {
  id: string;
  type: 'comment' | 'score' | 'justification';
  criterion: string;
  message: string;
}

interface MissingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  missingItems: MissingItem[];
}

export const MissingInfoModal: React.FC<MissingInfoModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  missingItems,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M11 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V7C20 6.46957 19.7893 5.96086 19.4142 5.58579C19.0391 5.21071 18.5304 5 18 5H13" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9L7 12L10 15" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 15H17" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'score':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M9 19V13C9 12.4696 8.78929 11.9609 8.41421 11.5858C8.03914 11.2107 7.53043 11 7 11H5" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 19V5C15 4.46957 14.7893 3.96086 14.4142 3.58579C14.0391 3.21071 13.5304 3 13 3H11" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 19C9 19.5304 9.21071 20.0391 9.58579 20.4142C9.96086 20.7893 10.4696 21 11 21H13C13.5304 21 14.0391 20.7893 14.4142 20.4142C14.7893 20.0391 15 19.5304 15 19" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Missing Information"
      type="error"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M18 6L6 18M6 6L18 18M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EB5757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              Your evaluation is incomplete. Please review the following missing items before submission:
            </p>
          </div>
        </div>

        {/* Missing Items List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {missingItems.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-[#FFF5F5] border border-[#EB5757] rounded-lg"
            >
              <span className="shrink-0 mt-0.5">{getIcon(item.type)}</span>
              <div>
                <p className="text-sm font-medium text-[#333333]" style={{ fontSize: '13px' }}>
                  {item.criterion}
                </p>
                <p className="text-xs text-[#EB5757]" style={{ fontSize: '12px' }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-3 bg-[#F5F5F5] rounded-lg">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
              {missingItems.length} item{missingItems.length > 1 ? 's' : ''} require attention
            </p>
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
            Fix Missing Items
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-3 bg-[#953002] text-white rounded-md font-medium
              hover:bg-[#7A2802] transition-all"
            style={{ fontSize: '14px' }}
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </Modal>
  );
};