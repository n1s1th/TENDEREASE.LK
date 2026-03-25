// app/components/evaluation/DownloadOptionsModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface DownloadOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'pdf' | 'excel') => void;
}

export const DownloadOptionsModal: React.FC<DownloadOptionsModalProps> = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Score Sheet"
      type="info"
    >
      <div className="space-y-4">
        <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
          Select your preferred format for the score sheet:
        </p>

        {/* Format Options */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* PDF Option */}
          <button
            onClick={() => onDownload('pdf')}
            className="p-4 border-2 border-[#E0E0E0] rounded-lg hover:border-[#FFB401] 
              hover:bg-[#FFFBF0] transition-all text-left"
          >
            <div className="mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              PDF Format
            </p>
            <p className="text-xs text-[#828282] mt-1" style={{ fontSize: '12px' }}>
              Best for printing
            </p>
          </button>

          {/* Excel Option */}
          <button
            onClick={() => onDownload('excel')}
            className="p-4 border-2 border-[#E0E0E0] rounded-lg hover:border-[#FFB401] 
              hover:bg-[#FFFBF0] transition-all text-left"
          >
            <div className="mb-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 13H16" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17H16" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9V17" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 9V17" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              Excel Format
            </p>
            <p className="text-xs text-[#828282] mt-1" style={{ fontSize: '12px' }}>
              Best for analysis
            </p>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 bg-[#F5F5F5] text-[#333333] rounded-md
            font-medium hover:bg-[#E0E0E0] transition-all"
          style={{ fontSize: '14px' }}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};