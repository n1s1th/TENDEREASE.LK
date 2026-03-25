// app/components/evaluation/DocumentPreviewModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    name: string;
    type: 'pdf' | 'doc' | 'xlsx';
    size: string;
    uploadDate: string;
    url: string;
  } | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 13H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9H8" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'doc':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 13H14" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'xlsx':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13H16" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 17H16" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 9V17" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 9V17" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Preview"
      type="info"
      showCloseButton={true}
    >
      <div className="space-y-4">
        {/* Document Header */}
        <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-lg">
          <div className="shrink-0">{getIcon(document.type)}</div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#333333]" style={{ fontSize: '14px' }}>
              {document.name}
            </h4>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-[#828282]" style={{ fontSize: '12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V15" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {document.size}
              </span>
              <span className="text-xs text-[#828282]" style={{ fontSize: '12px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1">
                  <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {document.uploadDate}
              </span>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="border-2 border-[#E0E0E0] rounded-lg p-8 min-h-75 flex items-center justify-center bg-[#F5F5F5]">
          <div className="text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
              <path d="M15 3H21V9" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 14L11 15L15 11" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 3L9 3C8.46957 3 7.96086 3.21071 7.58579 3.58579C7.21071 3.96086 7 4.46957 7 5V21C7 21.5304 7.21071 22.0391 7.58579 22.4142C7.96086 22.7893 8.46957 23 9 23H20C20.5304 23 21.0391 22.7893 21.4142 22.4142C21.7893 22.0391 22 21.5304 22 21V10L15 3Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-[#828282]" style={{ fontSize: '14px' }}>
              Document preview not available
            </p>
            <p className="text-xs text-[#828282] mt-2" style={{ fontSize: '12px' }}>
              Please download to view this document
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
            Close
          </button>
          <button
            onClick={() => {
              alert(`Downloading ${document.name}...`);
            }}
            className="flex-1 px-4 py-3 bg-[#FFB401] text-white rounded-md font-medium
              hover:bg-[#E5A200] transition-all"
            style={{ fontSize: '14px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download
          </button>
        </div>
      </div>
    </Modal>
  );
};