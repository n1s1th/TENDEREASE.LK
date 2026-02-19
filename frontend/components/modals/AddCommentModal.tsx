'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface AddCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commentText: string) => void;
}

export default function AddCommentModal({
  isOpen,
  onClose,
  onSave,
}: AddCommentModalProps) {
  const [commentText, setCommentText] = useState('');

  // Reset comment when modal opens
  useEffect(() => {
    if (isOpen) {
      setCommentText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (commentText.trim()) {
      onSave(commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(26,23,20,0.5)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface rounded-[16px] shadow-lg max-w-[480px] w-full animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-text-muted" />
            <h2 className="font-serif text-[20px] font-bold text-text-primary">Add Comment</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-bg flex items-center justify-center text-text-muted hover:bg-danger-bg hover:text-danger transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <div className="mb-4">
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">
              Enter your comment here
            </label>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your comment..."
              rows={4}
              className="w-full min-h-[100px] px-3.5 py-3 border border-border rounded-md text-[13.5px] text-text-primary bg-bg focus:outline-none focus:border-primary focus:bg-surface focus:ring-3 focus:ring-primary/10 resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-7 py-5 border-t border-border bg-surface-2 rounded-b-[16px]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-primary hover:bg-primary-light text-white" 
            onClick={handleSave}
            disabled={!commentText.trim()}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}