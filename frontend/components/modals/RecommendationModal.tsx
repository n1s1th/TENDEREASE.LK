'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

export default function RecommendationModal({
  isOpen,
  onClose,
  onSaveDraft,
  onSubmit,
}: RecommendationModalProps) {
  const [formData, setFormData] = useState({
    tenderId: '',
    selectedBidder: '',
    finalScore: '',
    awardValue: '',
    justification: '',
  });
  const [showError, setShowError] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowError(false); 
  };

  const validateForm = () => {
    const requiredFields = [
      'tenderId',
      'selectedBidder',
      'finalScore',
      'awardValue',
      'justification',
    ];
    return requiredFields.every((field) => formData[field as keyof typeof formData].trim() !== '');
  };

const handleResubmit = () => {
  if (!validateForm()) { setShowError(true); return; }
  showTopNotification('Recommendation submitted to Approval Chain');
  onSubmit();
};

const handleSaveDraft = () => {
  if (!validateForm()) { setShowError(true); return; }
  showTopNotification('Recommendation saved to draft');
  onSaveDraft();
};

const showTopNotification = (message: string) => {
  const notification = document.createElement('div');
  notification.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 bg-text-primary text-white px-6 py-3 rounded-lg font-medium text-[13.5px] z-[9999] animate-in shadow-lg';
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
};


  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(26,23,20,0.5)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface rounded-[16px] shadow-lg max-w-[580px] w-full animate-in">
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="font-serif text-[20px] font-bold text-text-primary">
            Create Recommendation Note
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-bg flex items-center justify-center text-text-muted hover:bg-danger-bg hover:text-danger transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-7 py-6 space-y-4">
          {/* Error Message */}
          {showError && (
            <div className="bg-danger-bg border border-danger text-danger px-4 py-3 rounded-md text-[13px]">
              Please fill in all required fields marked with *
            </div>
          )}

          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
              Tender ID <span className="text-danger">*</span>
            </label>
            <Input
              value={formData.tenderId}
              onChange={(e) => handleInputChange('tenderId', e.target.value)}
              placeholder="e.g. T-1001"
              className={showError && !formData.tenderId.trim() ? 'border-danger' : ''}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
              Selected Bidder <span className="text-danger">*</span>
            </label>
            <Input
              value={formData.selectedBidder}
              onChange={(e) => handleInputChange('selectedBidder', e.target.value)}
              placeholder="Bidder name..."
              className={showError && !formData.selectedBidder.trim() ? 'border-danger' : ''}
            />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Final Evaluation Score <span className="text-danger">*</span>
              </label>
              <Input
                value={formData.finalScore}
                onChange={(e) => handleInputChange('finalScore', e.target.value)}
                placeholder="e.g. 92%"
                className={showError && !formData.finalScore.trim() ? 'border-danger' : ''}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                Award Value (LKR) <span className="text-danger">*</span>
              </label>
              <Input
                value={formData.awardValue}
                onChange={(e) => handleInputChange('awardValue', e.target.value)}
                placeholder="e.g. 4,850,000"
                className={showError && !formData.awardValue.trim() ? 'border-danger' : ''}
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
              Justification / Recommendation <span className="text-danger">*</span>
            </label>
            <Textarea
              value={formData.justification}
              onChange={(e) => handleInputChange('justification', e.target.value)}
              placeholder="Provide detailed justification for selecting the bidder..."
              rows={4}
              className={`w-full min-h-[100px] ${
                showError && !formData.justification.trim() ? 'border-danger' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
              Attach Supporting Documents <span className="text-text-muted">(Optional)</span>
            </label>
            <div className="border border-border rounded-md px-3.5 py-2.5 bg-bg">
              <input type="file" className="text-[13px] font-sans" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-7 py-5 border-t border-border bg-surface-2 rounded-b-[16px]">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button className="bg-primary hover:bg-primary-light text-white" onClick={handleResubmit}>
            Submit to Approval Chain
          </Button>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translate(-50%, 0);
            opacity: 1;
          }
          to {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}