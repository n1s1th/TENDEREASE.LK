'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface EditRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  rejectionReason: string;
  onSaveDraft: () => void;
  onResubmit: () => void;
}

export default function EditRecommendationModal({
  isOpen,
  onClose,
  tenderId,
  rejectionReason,
  onSaveDraft,
  onResubmit,
}: EditRecommendationModalProps) {
  const [formData, setFormData] = useState({
    selectedBidder: '',
    awardValue: '',
    justification: '',
  });
  const [showError, setShowError] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowError(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const validateForm = () => {
    const requiredFields = ['selectedBidder', 'awardValue', 'justification'];
    return requiredFields.every(
      (field) => formData[field as keyof typeof formData].trim() !== ''
    );
  };

  const handleResubmit = () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }
    showTopNotification('Recommendation submitted to Approval Chain');
    onResubmit();
  };

  const handleSaveDraft = () => {
    if (!validateForm()) {
      setShowError(true);
      return;
    }
    showTopNotification('Recommendation saved to draft');
    onSaveDraft();
  };

  const showTopNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className =
      'fixed top-6 left-1/2 transform -translate-x-1/2 bg-text-primary text-white px-6 py-3 rounded-lg font-medium text-[13.5px] z-[9999] animate-in';
    notification.style.cssText = `
      animation: slideDown 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(26,23,20,0.5)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface rounded-[16px] shadow-lg max-w-[700px] w-full animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <h2 className="font-serif text-[24px] font-bold text-text-primary">
            Edit Recommendation
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-bg flex items-center justify-center text-text-muted hover:bg-danger-bg hover:text-danger transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-6">
          {/* Error Message */}
          {showError && (
            <div className="bg-danger-bg border border-danger text-danger px-4 py-3 rounded-md text-[13px]">
              Please fill in all required fields marked with *
            </div>
          )}

          {/* Rejection Reason Section (Read-only) */}
          <div>
            <h3 className="text-[16px] font-bold text-text-primary mb-4">
              Rejection Reason
            </h3>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-semibold text-text-secondary">
                  Rejected by CAO
                </span>
                <span className="text-[11px] text-text-muted px-2 py-1 bg-bg rounded">
                  Timestamp
                </span>
              </div>
              <div className="border border-border rounded-md p-4 bg-bg">
                <p className="text-[13px] text-text-secondary">
                  {rejectionReason || 'Insufficient technical justification.'}
                </p>
              </div>
            </div>
          </div>

          {/* Editable Section */}
          <div>
            <h3 className="text-[16px] font-bold text-text-primary mb-4">
              Editable Section
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Selected Bidder <span className="text-danger">*</span>
                </label>
                <Input
                  value={formData.selectedBidder}
                  onChange={(e) => handleInputChange('selectedBidder', e.target.value)}
                  placeholder="Bidder name..."
                  className={
                    showError && !formData.selectedBidder.trim() ? 'border-danger' : ''
                  }
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Award Value <span className="text-danger">*</span>
                </label>
                <Input
                  value={formData.awardValue}
                  onChange={(e) => handleInputChange('awardValue', e.target.value)}
                  placeholder="e.g. LKR 4,850,000"
                  className={
                    showError && !formData.awardValue.trim() ? 'border-danger' : ''
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Justification / Recommendation <span className="text-danger">*</span>
                </label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => handleInputChange('justification', e.target.value)}
                  placeholder="Provide detailed justification..."
                  rows={4}
                  className={`w-full min-h-[100px] ${
                    showError && !formData.justification.trim() ? 'border-danger' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
                  Upload Revised Documents <span className="text-text-muted">(Optional)</span>
                </label>
                <div className="border border-border rounded-md px-3.5 py-2.5 bg-bg">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-text-muted" />
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="text-[13px] font-sans flex-1"
                    />
                  </div>
                  {uploadedFile && (
                    <p className="text-[12px] text-text-muted mt-2">
                      Selected: {uploadedFile}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-7 py-5 border-t border-border bg-surface-2 rounded-b-[16px]">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save as Draft
          </Button>
          <Button className="bg-primary hover:bg-primary-light text-white" onClick={handleResubmit}>
            Resubmit to Approval Chain
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