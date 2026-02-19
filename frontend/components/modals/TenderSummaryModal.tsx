'use client';
import { useState } from 'react';
import { X, Calendar, DollarSign, Building2, Clock, Filter, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface TenderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: any;
  onAddComment: () => void;
  onCreateRecommendation: () => void;
  comments?: string[];
  onCommentAdded?: (comment: string) => void;
  onCommentDeleted?: (index: number) => void; 
}

export default function TenderSummaryModal({
  isOpen,
  onClose,
  tender,
  onAddComment,
  onCreateRecommendation,
  comments = [],
  onCommentAdded,
  onCommentDeleted,
}: TenderSummaryModalProps) {
  if (!isOpen) return null;

  // Sample bidder data
  const bidders = [
    { rank: 1, name: 'Supplier Name Placeholder', bidId: 'BID-0041-003', technical: 44.0, financial: 43.4, composite: 87.4, compliance: 'passed', sme: true },
    { rank: 2, name: 'Supplier Name Placeholder', bidId: 'BID-0041-002', technical: 41.5, financial: 37.0, composite: 78.5, compliance: 'passed', sme: true },
    { rank: 3, name: 'Supplier Name Placeholder', bidId: 'BID-0041-001', technical: 32.0, financial: 34.5, composite: 66.5, compliance: 'flag', sme: false },
    { rank: 4, name: 'Supplier Name Placeholder', bidId: 'BID-0041-006', technical: 29.0, financial: 30.1, composite: 59.1, compliance: 'flagged', sme: false },
  ];

  // Calculate SME participation based on actual data
  const smeCount = bidders.filter(b => b.sme).length;
  const totalBidders = bidders.length;
  const smePercentage = Math.round((smeCount / totalBidders) * 100);

  // Sorting state
  const [sortBy, setSortBy] = useState<'final' | 'technical' | 'financial'>('final');
  const [sortedBidders, setSortedBidders] = useState(bidders);

  // Handle sorting
  const handleSort = (value: string) => {
    const sorted = [...bidders].sort((a, b) => {
      if (value === 'technical') return b.technical - a.technical;
      if (value === 'financial') return b.financial - a.financial;
      return b.composite - a.composite;
    });
    setSortedBidders(sorted);
    setSortBy(value as any);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[rgba(26,23,20,0.5)] backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-surface rounded-[16px] shadow-lg max-w-[860px] w-full max-h-[90vh] overflow-y-auto animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <div>
            <h2 className="font-serif text-[20px] font-bold text-text-primary">Tender Summary</h2>
            <p className="text-[13px] text-text-muted mt-1">{tender?.id || 'T-1001'}</p>
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
          {/* Meta Strip */}
          <div className="grid grid-cols-4 gap-4 mb-6 p-5 bg-surface-2 border border-border rounded-lg">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">
                <Calendar className="h-3 w-3" /> Closing Date
              </div>
              <div className="text-[14px] font-semibold text-text-primary">
                {tender?.closingDate || 'Dec 22, 2025'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">
                <DollarSign className="h-3 w-3" /> Est. Budget
              </div>
              <div className="text-[14px] font-semibold text-text-primary">
                {tender?.budget || 'LKR 5,000,000'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">
                <Building2 className="h-3 w-3" /> Department
              </div>
              <div className="text-[14px] font-semibold text-text-primary">
                {tender?.department || 'IT & Technology'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-text-muted mb-1">
                <Clock className="h-3 w-3" /> Time Remaining
              </div>
              <div className="text-[14px] font-semibold text-warning">
                {tender?.timeRemaining || '10 Days 5 Hours'}
              </div>
            </div>
          </div>

          {/* Evaluation Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-text-primary">Evaluation Summary</h3>
              <div className="flex gap-2">
                <Select defaultValue="final" onValueChange={handleSort}>
                  <SelectTrigger className="w-[140px] text-[12px] bg-surface border-border">
                    <SelectValue placeholder="Sort: Final Score" />
                  </SelectTrigger>
                  <SelectContent className="bg-surface border-border">
                    <SelectItem value="final">Sort: Final Score</SelectItem>
                    <SelectItem value="technical">Sort: Technical</SelectItem>
                    <SelectItem value="financial">Sort: Financial</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="text-[12px]">
                  <Filter className="h-3 w-3 mr-1" /> Filter
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-2">
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Rank</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Bidder</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Technical /50</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Financial /50</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Composite /100</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">Compliance</TableHead>
                    <TableHead className="text-[11px] font-bold uppercase tracking-wide text-text-muted">SME</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBidders.map((bidder, index) => (
                    <TableRow key={bidder.bidId} className="hover:bg-[#faf8f6]">
                      <TableCell>
                        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[12px] font-bold text-text-primary bg-[#f0ede8] border border-border">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-text-primary">{bidder.name}</div>
                        <div className="text-[11px] text-text-muted">{bidder.bidId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-[5px] w-[60px] rounded bg-[#f0ede8] overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded"
                              style={{ width: `${(bidder.technical / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-[13px]">{bidder.technical}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-[5px] w-[60px] rounded bg-[#f0ede8] overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded"
                              style={{ width: `${(bidder.financial / 50) * 100}%` }}
                            />
                          </div>
                          <span className="text-[13px]">{bidder.financial}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-text-primary">{bidder.composite}</TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          bidder.compliance === 'passed' ? 'bg-success-bg text-success' :
                          bidder.compliance === 'flag' ? 'bg-warning-bg text-warning' : 'bg-danger-bg text-danger'
                        }`}>
                          {bidder.compliance === 'passed' ? '✓' : bidder.compliance === 'flag' ? '⚠' : '✗'} 
                          {bidder.compliance === 'passed' ? ' Passed' : bidder.compliance === 'flag' ? ' Minor Flag' : ' Flagged'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          bidder.sme ? 'bg-success-bg text-success' : 'bg-[#f0ede8] text-text-muted'
                        }`}>
                          {bidder.sme ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-surface-2 text-text-primary px-3 py-1.5 rounded-md text-[12px] font-semibold mt-3 border border-border">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              SME Participation: {smeCount} out of {totalBidders} bidders ({smePercentage}%)
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-surface-2 border border-border rounded-md p-3.5 mb-6">
            <div className="text-[12px] font-bold uppercase tracking-wide text-text-muted mb-2">
              Comments
            </div>
            {comments.length === 0 ? (
              <div className="text-text-muted text-[13px] italic">No comments yet.</div>
            ) : (
              <div className="space-y-2">
                {comments.map((comment, idx) => (
                  <div 
                    key={idx} 
                    className="text-[13px] text-text-primary bg-surface p-3 rounded border border-border flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <p>{comment}</p>
                      <p className="text-[11px] text-text-muted mt-1">
                        Added on {new Date().toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => onCommentDeleted?.(idx)}
                      className="text-text-muted hover:text-danger transition-colors p-1 rounded hover:bg-danger-bg"
                      title="Delete comment"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approval Timeline */}
          <div className="bg-surface-2 border border-border rounded-lg p-5 mb-6">
            <div className="flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-text-muted mb-4">
              <Clock className="h-3.5 w-3.5" /> Approval History
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { role: 'Officer', status: 'Submitted', done: true, date: 'Jan 10, 2026' },
                { role: 'Technical Head', status: 'Approved', done: true, date: 'Jan 12, 2026' },
                { role: 'Procurement Head', status: 'Approved', done: true, date: 'Jan 14, 2026' },
                { role: 'CAO', status: 'Pending', done: false, date: '—' },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] flex-shrink-0 ${
                      step.done ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'
                    }`}>
                      {step.done ? '✓' : '-'}
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-text-primary">{step.role}</div>
                      <div className={`text-[11px] ${step.done ? 'text-text-muted' : 'text-warning'}`}>{step.status}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-muted ml-[38px]">{step.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-7 py-5 border-t border-border bg-surface-2 rounded-b-[16px]">
          <Button variant="outline" onClick={onAddComment}>
            Add Comments
          </Button>
          <Button className="bg-accent hover:bg-accent-dark text-text-primary" onClick={onCreateRecommendation}>
            Create Recommendation Note
          </Button>
        </div>
      </div>
    </div>
  );
}