// app/(dashboard)/evaluations/[tenderId]/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import AppHeader from '@/components/common/AppHeader';
import { useEvaluationStore } from '@/stores/evaluation.store';
import { BidEvaluationHeader } from '@/app/components/evaluation/BidEvaluationHeader';
import { BidderListSidebar } from '@/app/components/evaluation/BidderListSidebar';
import { BidDocumentsSection } from '@/app/components/evaluation/BidDocumentsSection';
import { TechnicalEvaluationSection } from '@/app/components/evaluation/TechnicalEvaluationSection';
import { FinancialEvaluationSection } from '@/app/components/evaluation/FinancialEvaluationSection';
import { ScoreSummaryPanel } from '@/app/components/evaluation/ScoreSummaryPanel';
import { EvaluationInfoPanel } from '@/app/components/evaluation/EvaluationInfoPanel';
import { EvaluationActions } from '@/app/components/evaluation/EvaluationActions';
import { SubmitConfirmationModal } from '@/app/components/evaluation/SubmitConfirmationModal';
import { DownloadOptionsModal } from '@/app/components/evaluation/DownloadOptionsModal';
import { SaveDraftModal } from '@/app/components/evaluation/SaveDraftModal';
import { LowScoreWarningModal } from '@/app/components/evaluation/LowScoreWarningModal';
import { EvaluationNotesModal } from '@/app/components/evaluation/EvaluationNotesModal';
import { MissingInfoModal } from '@/app/components/evaluation/MissingInfoModal';
import { DocumentPreviewModal } from '@/app/components/evaluation/DocumentPreviewModal';
import { EvaluationData } from '@/types/evaluation.types';

// Mock Data Factory - uses dynamic tenderId from params
const createMockData = (tenderId: string): EvaluationData => ({
  tender: {
    id: tenderId,
    title: 'ERP System Upgrade',
    category: 'IT & Software',
    department: 'IT Division',
    division: 'Procurement',
  },
  bidder: {
    id: 'BID-002',
    name: 'ClearTech Solutions',
    bidReference: 'BID-002',
    status: 'in_progress',
    submissionTime: '2026-02-10T14:30:00Z',
  },
  documents: [
    { name: 'Technical Proposal.pdf', type: 'pdf', url: '#' },
    { name: 'Financial Offer.pdf', type: 'pdf', url: '#' },
    { name: 'Company Profile.pdf', type: 'pdf', url: '#' },
    { name: 'Compliance Checklist.pdf', type: 'pdf', url: '#' },
  ],
  technical: {
    criteria: [
      { id: 't1', name: 'Technical Approach', description: 'Methodology and solution alignment', weight: 30, maxScore: 100 },
      { id: 't2', name: 'Team Qualifications', description: 'CVs and relevant experience', weight: 25, maxScore: 100 },
      { id: 't3', name: 'Implementation Plan', description: 'Timeline, milestones, risk management', weight: 25, maxScore: 100 },
      { id: 't4', name: 'Past Performance', description: 'References and case studies', weight: 20, maxScore: 100 },
    ],
    scores: [
      { criterionId: 't1', score: 72, comment: 'Solution is well-structured. ERP mapping is clear.', weightedScore: 21.6 },
      { criterionId: 't2', score: 75, comment: '3 senior engineers with ERP certs provided.', weightedScore: 18.75 },
      { criterionId: 't3', score: 65, comment: 'Timeline is feasible. Risk register is minimal.', weightedScore: 16.25 },
      { criterionId: 't4', score: 55, comment: 'Only 2 references. No large-scale government projects.', weightedScore: 11.0 },
    ],
    totalScore: 67.6,
    maxScore: 100,
    threshold: 60,
    passed: true,
  },
  financial: {
    criteria: [
      { id: 'f1', name: 'Bid Price Competitiveness', description: 'Relative to lowest compliant bid', weight: 50, maxScore: 100 },
      { id: 'f2', name: 'Payment Terms', description: 'Milestone structure and flexibility', weight: 30, maxScore: 100 },
      { id: 'f3', name: 'Value-Added Services', description: 'Training, support, warranty', weight: 20, maxScore: 100 },
    ],
    scores: [
      { criterionId: 'f1', score: 80, comment: 'Price is within 8% of lowest bid. Competitive.', weightedScore: 40.0 },
      { criterionId: 'f2', score: 70, comment: 'Reasonable milestone split. Advance payment is 20%.', weightedScore: 21.0 },
      { criterionId: 'f3', score: 65, comment: '2-year warranty offered. Training for 10 staff.', weightedScore: 13.0 },
    ],
    totalScore: 74.0,
    maxScore: 100,
  },
  summary: {
    technicalScore: 67.6,
    financialScore: 74.0,
    technicalWeight: 0.70,
    financialWeight: 0.30,
    weightedTechnicalScore: 47.32,
    weightedFinancialScore: 22.2,
    finalCompositeScore: 69.52,
  },
  info: {
    evaluator: {
      id: 'E001',
      name: 'Jane Doe',
      role: 'member',
      designation: 'Senior Designer',
    },
    bidder: {
      id: 'BID-002',
      name: 'ClearTech Solutions',
      bidReference: 'BID-002',
      status: 'in_progress',
      submissionTime: '2026-02-10T14:30:00Z',
    },
    status: 'in_progress',
    lastSaved: '11 Feb 2026, 14:32',
  },
});

export default function EvaluationPage() {
  const params = useParams<{ tenderId: string }>();
  const tenderId = params.tenderId;
  
  const { 
    evaluationData, 
    setEvaluationData, 
    updateTechnicalScore: updateTechnicalScoreFn, 
    updateFinancialScore: updateFinancialScoreFn,
    calculateSummary,
    saveDraft,
    submitEvaluation,
    setLoading 
  } = useEvaluationStore();

  const [selectedBidderId, setSelectedBidderId] = useState<string>('BID-002');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [evaluationNotes, setEvaluationNotes] = useState('');
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showLowScoreModal, setShowLowScoreModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const [showDocumentPreviewModal, setShowDocumentPreviewModal] = useState(false);

  // Ref to prevent infinite loop
  const isCalculatingRef = useRef(false);

  // Load initial data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvaluationData(createMockData(tenderId));
      setLoading(false);
    }, 500);
  }, [tenderId, setLoading, setEvaluationData]);

  // Calculate summary when data loads (with guard to prevent infinite loop)
  useEffect(() => {
    if (evaluationData && !isCalculatingRef.current) {
      isCalculatingRef.current = true;
      calculateSummary();
      setTimeout(() => {
        isCalculatingRef.current = false;
      }, 0);
    }
  }, [evaluationData, calculateSummary]);

  // Handler functions for score updates with automatic summary calculation
  const updateTechnicalScore = (criterionId: string, score: number, comment: string) => {
    updateTechnicalScoreFn(criterionId, score, comment);
    // Defer summary calculation to avoid infinite loop
    setTimeout(() => calculateSummary(), 0);
  };

  const updateFinancialScore = (criterionId: string, score: number, comment: string) => {
    updateFinancialScoreFn(criterionId, score, comment);
    // Defer summary calculation to avoid infinite loop
    setTimeout(() => calculateSummary(), 0);
  };

  // Handler functions for modals
  const handleSaveDraft = () => {
    setShowSaveDraftModal(true);
  };

  const handleConfirmSaveDraft = async () => {
    setIsSaving(true);
    await saveDraft();
    setIsSaving(false);
    setShowSaveDraftModal(false);
    alert('Draft saved successfully!');
  };

  const handleSubmitEvaluation = () => {
    const missingItems: { id: string; type: 'comment' | 'score' | 'justification'; criterion: string; message: string }[] = [];
    
    if (evaluationData) {
      evaluationData.technical.criteria.forEach((criterion) => {
        const score = evaluationData.technical.scores.find(s => s.criterionId === criterion.id);
        if (!score || !score.comment || score.comment.trim().length === 0) {
          missingItems.push({
            id: criterion.id,
            type: 'comment',
            criterion: criterion.name,
            message: 'Missing evaluator comment',
          });
        }
      });
    }

    if (missingItems.length > 0) {
      setShowMissingInfoModal(true);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    await submitEvaluation();
    setIsSubmitting(false);
    setShowSubmitModal(false);
    alert('Evaluation submitted successfully!');
  };

  const handleContinueSubmit = () => {
    setShowMissingInfoModal(false);
    setShowSubmitModal(true);
  };

  const handleDownloadScoreSheet = () => {
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = (format: 'pdf' | 'excel') => {
    setShowDownloadModal(false);
    alert(`Downloading score sheet in ${format.toUpperCase()} format...`);
  };

  const handleAddNotes = () => {
    setShowNotesModal(true);
  };

  const handleSaveNotes = (notes: string) => {
    setEvaluationNotes(notes);
    alert('Notes saved successfully!');
  };

  const handleLowScoreConfirm = (justification: string) => {
    setShowLowScoreModal(false);
    alert(`Justification saved: ${justification}`);
  };

  if (!evaluationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[#828282]">Loading evaluation data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* AppHeader */}
      <AppHeader />
      
      {/* Main content area */}
      <div className="p-6">
        {/* Header */}
        <BidEvaluationHeader
          tenderId={evaluationData.tender.id}
          tenderTitle={evaluationData.tender.title}
          category={evaluationData.tender.category}
          software={evaluationData.tender.division}
          technicalWeight={evaluationData.summary.technicalWeight * 100}
          financialWeight={evaluationData.summary.financialWeight * 100}
          dueDate="28 Feb 2026"
          bidsReceived={12}
          threshold={evaluationData.technical.threshold}
        />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          
          {/* Left Sidebar - Bidder List (3 columns) */}
          <div className="col-span-3">
            <BidderListSidebar
              bidders={[
                { id: 'BID-001', name: 'Apex Build Ltd.', bidReference: 'BID-001', status: 'submitted' },
                { id: 'BID-002', name: 'ClearTech Solutions', bidReference: 'BID-002', status: 'in_progress' },
                { id: 'BID-003', name: 'DataSphere Inc.', bidReference: 'BID-003', status: 'not_started' },
                { id: 'BID-004', name: 'GridX Enterprise', bidReference: 'BID-004', status: 'submitted' },
                { id: 'BID-005', name: 'TechFlow Systems', bidReference: 'BID-005', status: 'submitted' },
                { id: 'BID-006', name: 'NexGen Solutions Pvt Ltd', bidReference: 'BID-006', status: 'not_started' },
                { id: 'BID-007', name: 'GlobalTech Innovations', bidReference: 'BID-007', status: 'in_progress' },
                { id: 'BID-008', name: 'Digital Dynamics Corp', bidReference: 'BID-008', status: 'submitted' },
                { id: 'BID-009', name: 'InfoSys Technologies', bidReference: 'BID-009', status: 'not_started' },
                { id: 'BID-010', name: 'CloudFirst Solutions', bidReference: 'BID-010', status: 'submitted' },
                { id: 'BID-011', name: 'Enterprise Systems Ltd', bidReference: 'BID-011', status: 'in_progress' },
                { id: 'BID-012', name: 'SmartBiz Technologies', bidReference: 'BID-012', status: 'not_started' },
              ]}
              selectedBidderId={selectedBidderId}
              onSelectBidder={setSelectedBidderId}
            />
          </div>

          {/* Center Content - Evaluation Sections (6 columns) */}
          <div className="col-span-6">
            <BidDocumentsSection
              bidderName={evaluationData.bidder.name}
              bidReference={evaluationData.bidder.bidReference}
              documents={evaluationData.documents}
            />

            <TechnicalEvaluationSection
              criteria={evaluationData.technical.criteria}
              scores={evaluationData.technical.scores}
              totalScore={evaluationData.technical.totalScore}
              maxScore={evaluationData.technical.maxScore}
              threshold={evaluationData.technical.threshold}
              weight={evaluationData.summary.technicalWeight * 100}
              onScoreUpdate={updateTechnicalScore}
            />

            <FinancialEvaluationSection
              criteria={evaluationData.financial.criteria}
              scores={evaluationData.financial.scores}
              totalScore={evaluationData.financial.totalScore}
              maxScore={evaluationData.financial.maxScore}
              weight={evaluationData.summary.financialWeight * 100}
              unlocked={evaluationData.technical.passed}
              technicalThresholdMet={evaluationData.technical.passed}
              onScoreUpdate={updateFinancialScore}
            />
          </div>

          {/* Right Sidebar - Summary & Actions (3 columns) */}
          <div className="col-span-3">
            <ScoreSummaryPanel
              technicalScore={evaluationData.summary.technicalScore}
              financialScore={evaluationData.summary.financialScore}
              technicalWeight={evaluationData.summary.technicalWeight}
              financialWeight={evaluationData.summary.financialWeight}
              weightedTechnicalScore={evaluationData.summary.weightedTechnicalScore}
              weightedFinancialScore={evaluationData.summary.weightedFinancialScore}
              finalCompositeScore={evaluationData.summary.finalCompositeScore}
              threshold={evaluationData.technical.threshold}
            />

            <EvaluationInfoPanel
              evaluator={evaluationData.info.evaluator}
              bidderName={evaluationData.info.bidder.name}
              bidReference={evaluationData.info.bidder.bidReference}
              status={evaluationData.info.status}
              lastSaved={evaluationData.info.lastSaved}
            />

            {/* Add Notes Button */}
            <div className="mt-4">
              <button
                onClick={handleAddNotes}
                className="w-full px-4 py-3 bg-white border-2 border-[#FFB401] text-[#953002] rounded-md
                  font-medium hover:bg-[#FFFBF0] transition-all flex items-center justify-center gap-2"
                style={{ fontSize: '14px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H18C18.5304 21 19.0391 20.7893 19.4142 20.4142C19.7893 20.0391 20 19.5304 20 19V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50001C18.8978 2.50001 19.2794 2.65804 19.5607 2.93935C19.842 3.22065 20 3.60219 20 4.00001C20 4.39784 19.842 4.77937 19.5607 5.06067L8.5 16.1213L4.5 17.1213L5.5 13.1213L16.5 2.06067C16.7813 1.77937 17.1628 1.62134 17.5607 1.62134C17.9585 1.62134 18.34 1.77937 18.6213 2.06067L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Evaluation Notes
              </button>
            </div>

            <EvaluationActions
              onSaveDraft={handleSaveDraft}
              onSubmitEvaluation={handleSubmitEvaluation}
              onDownloadScoreSheet={handleDownloadScoreSheet}
              isSubmitting={isSubmitting}
              canSubmit={true}
            />
          </div>
        </div>

        {/* Modals */}
        <SaveDraftModal
          isOpen={showSaveDraftModal}
          onClose={() => setShowSaveDraftModal(false)}
          onSave={handleConfirmSaveDraft}
          isSaving={isSaving}
        />

        <SubmitConfirmationModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          onConfirm={handleConfirmSubmit}
          isSubmitting={isSubmitting}
        />

        <DownloadOptionsModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          onDownload={handleConfirmDownload}
        />

        <LowScoreWarningModal
          isOpen={showLowScoreModal}
          onClose={() => setShowLowScoreModal(false)}
          onConfirm={handleLowScoreConfirm}
          criterionName="Technical Approach"
          score={45}
        />

        <EvaluationNotesModal
          isOpen={showNotesModal}
          onClose={() => setShowNotesModal(false)}
          onSave={handleSaveNotes}
          existingNotes={evaluationNotes}
        />

        <MissingInfoModal
          isOpen={showMissingInfoModal}
          onClose={() => setShowMissingInfoModal(false)}
          onContinue={handleContinueSubmit}
          missingItems={[]}
        />

        <DocumentPreviewModal
          isOpen={showDocumentPreviewModal}
          onClose={() => setShowDocumentPreviewModal(false)}
          document={null}
        />
      </div>
    </div>
  );
}