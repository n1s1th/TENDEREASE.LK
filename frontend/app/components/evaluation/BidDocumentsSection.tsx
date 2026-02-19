// app/components/evaluation/BidDocumentsSection.tsx
'use client';

import React from 'react';

interface BidDocument {
  name: string;
  type: 'pdf' | 'doc' | 'xlsx';
  url: string;
}

interface BidDocumentsSectionProps {
  bidderName: string;
  bidReference: string;
  documents: BidDocument[];
}

export const BidDocumentsSection: React.FC<BidDocumentsSectionProps> = ({
  bidderName,
  bidReference,
  documents,
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'doc':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 13H14" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'xlsx':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 13L10 15L14 11" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="#FFB401" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-lg font-semibold text-[#333333]" style={{ fontSize: '16px' }}>
          Bid Documents — {bidderName} ({bidReference})
        </h2>
      </div>

      {/* Document List */}
      <div className="flex flex-wrap gap-3">
        {documents.map((doc, index) => (
          <button
            key={index}
            className="flex items-center gap-2 px-4 py-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded-md
              hover:bg-[#E0E0E0] hover:border-[#B0B0B0] transition-all"
          >
            <span className="shrink-0">{getFileIcon(doc.type)}</span>
            <span className="text-sm text-[#333333]" style={{ fontSize: '14px' }}>
              {doc.name}
            </span>
          </button>
        ))}

        {/* View All Button */}
        <button className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-[#B0B0B0] rounded-md
          hover:border-[#FFB401] hover:text-[#953002] transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="#828282" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-[#828282]" style={{ fontSize: '14px' }}>
            View All ({documents.length + 3})
          </span>
        </button>
      </div>
    </div>
  );
};