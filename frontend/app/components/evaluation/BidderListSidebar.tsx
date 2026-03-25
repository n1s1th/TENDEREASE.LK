// app/components/evaluation/BidderListSidebar.tsx
'use client';

import React from 'react';

interface Bidder {
  id: string;
  name: string;
  bidReference: string;
  status: 'submitted' | 'in_progress' | 'not_started';
}

interface BidderListSidebarProps {
  bidders: Bidder[];
  selectedBidderId: string;
  onSelectBidder: (bidderId: string) => void;
}

export const BidderListSidebar: React.FC<BidderListSidebarProps> = ({
  bidders,
  selectedBidderId,
  onSelectBidder,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-[#953002] text-white';
      case 'in_progress':
        return 'bg-[#FFB401] text-white';
      case 'not_started':
        return 'bg-[#E0E0E0] text-[#828282]';
      default:
        return 'bg-[#E0E0E0] text-[#828282]';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[#333333]" style={{ fontSize: '16px' }}>
          Bidders
        </h3>
        <span className="text-sm text-[#828282]" style={{ fontSize: '13px' }}>
          {bidders.length} total
        </span>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search bidder..."
          className="w-full px-3 py-2 border border-[#B0B0B0] rounded-md text-sm
            focus:outline-none focus:ring-2 focus:ring-[#FFB401] focus:border-transparent
            text-[#333333] placeholder-[#828282]"
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* Bidder List */}
      <div className="space-y-2">
        {bidders.map((bidder) => (
          <button
            key={bidder.id}
            onClick={() => onSelectBidder(bidder.id)}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-all
              ${
                selectedBidderId === bidder.id
                  ? 'bg-[#FFF8E6] border-2 border-[#FFB401]'
                  : 'bg-[#F5F5F5] border-2 border-transparent hover:bg-[#E0E0E0]'
              }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-[#E0E0E0] flex items-center justify-center">
                <span className="text-xs font-medium text-[#828282]">
                  {bidder.name.substring(0, 2).toUpperCase()}
                </span>
              </div>

              {/* Bidder Info */}
              <div className="text-left">
                <p className="font-medium text-[#333333]" style={{ fontSize: '14px' }}>
                  {bidder.name}
                </p>
                <p className="text-xs text-[#828282]">{bidder.bidReference}</p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(bidder.status)}`}
              style={{ fontSize: '12px' }}
            >
              {getStatusLabel(bidder.status)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};