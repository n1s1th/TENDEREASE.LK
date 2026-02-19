// app/components/evaluation/EvaluationNotesModal.tsx
'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal';

interface EvaluationNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  existingNotes?: string;
}

export const EvaluationNotesModal: React.FC<EvaluationNotesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingNotes = '',
}) => {
  const [notes, setNotes] = React.useState(existingNotes);
  const maxCharacters = 1000;

  const handleSave = () => {
    onSave(notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluation Notes"
      type="info"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="text-[#333333]" style={{ fontSize: '14px', lineHeight: '1.4' }}>
              Add overall evaluation comments and justification. These notes will be included in the official evaluation record.
            </p>
          </div>
        </div>

        {/* Notes Text Area */}
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2" style={{ fontSize: '14px' }}>
            Overall Evaluation Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your overall evaluation notes, recommendations, and any additional comments..."
            rows={6}
            maxLength={maxCharacters}
            className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#FFB401] focus:border-transparent
              text-[#333333] placeholder-[#828282]"
            style={{ fontSize: '14px', fontFamily: 'Inter', lineHeight: '1.4' }}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-[#828282]" style={{ fontSize: '12px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-1 shrink-0">
                <path d="M12 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V16" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 14L22 18L18 22" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 18H14" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              These notes are visible to all committee members
            </span>
            <span className={`text-xs ${notes.length > maxCharacters * 0.9 ? 'text-[#EB5757]' : 'text-[#828282]'}`} style={{ fontSize: '12px' }}>
              {notes.length} / {maxCharacters} characters
            </span>
          </div>
        </div>

        {/* Existing Notes Display */}
        {existingNotes && existingNotes.length > 0 && (
          <div className="p-4 bg-[#F5F5F5] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-[#333333]" style={{ fontSize: '13px' }}>
                Previous Notes
              </span>
            </div>
            <p className="text-sm text-[#828282] italic" style={{ fontSize: '13px', lineHeight: '1.4' }}>
              {existingNotes.substring(0, 100)}{existingNotes.length > 100 ? '...' : ''}
            </p>
          </div>
        )}

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
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-[#953002] text-white rounded-md font-medium
              hover:bg-[#7A2802] transition-all"
            style={{ fontSize: '14px' }}
          >
            Save Notes
          </button>
        </div>
      </div>
    </Modal>
  );
};