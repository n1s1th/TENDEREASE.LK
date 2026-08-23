"use client";

import React, { useState } from 'react';
import { useVendorStore } from '../../../store/vendorRegistrationStore';
import { uploadDocument, deleteDocument } from '../../../lib/api/vendorApi';

export default function Step3Documents() {
  const { vendorId, uploadedDocuments, nextStep, prevStep, addDocument, removeDocument } = useVendorStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-75";

  const [documentType, setDocumentType] = useState('INCORPORATION_CERTIFICATE');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!vendorId) {
      setError("Vendor ID is missing. Please restart registration.");
      return;
    }
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }
    if (documentType === 'OTHER' && !documentTitle) {
      setError("Document title is required for OTHER document types.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const res = await uploadDocument(vendorId, selectedFile, documentType, documentTitle);
      addDocument(res);
      setSelectedFile(null);
      setDocumentTitle('');
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!vendorId) return;
    try {
      await deleteDocument(vendorId, docId);
      removeDocument(docId);
    } catch (e) {
      // In a real app, you might show a toast here
      console.error("Failed to delete document", e);
    }
  };

  const handleContinue = () => {
    if (uploadedDocuments.length === 0) {
      setError("Please upload at least one document (Business Registration recommended).");
      return;
    }
    nextStep();
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Supporting Documents</h2>
        <p className="text-gray-500 mt-1 text-sm">Upload business registration, tax documents, and any other relevant files. (Max 20MB per file, PDF/DOC/DOCX)</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-gray-50 p-6 rounded-md border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Document Type *</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
              className={inputCls}
            >
              <option value="INCORPORATION_CERTIFICATE">Business Registration</option>
              <option value="TAX_CLEARANCE">Tax Document</option>
              <option value="BANK_STATEMENT">Bank Statement</option>
              <option value="DIRECTOR_DETAILS">Director Details</option>
              <option value="FINANCIAL_REPORT">Financial Report</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Document Title {documentType === 'OTHER' ? '*' : '(Optional)'}</label>
            <input 
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="e.g. Audit Report 2023"
              className={inputCls} 
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Select File *</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-sm text-gray-500 file:mr-4 file:h-full file:px-4 file:border-0 file:bg-amber-50 file:text-amber-700 file:text-sm file:font-semibold hover:file:bg-amber-100 outline-none transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" 
            />
          </div>
        </div>
        
        <button 
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="h-10 px-4 bg-[#953002] text-white rounded-md text-sm font-semibold shadow hover:bg-amber-800 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      {/* Uploaded Files Table */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Uploaded Documents</h3>
        {uploadedDocuments.length === 0 ? (
          <p className="text-sm text-gray-500 italic p-4 text-center border rounded-md border-dashed">No documents uploaded yet.</p>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadedDocuments.map((doc) => (
                  <tr key={doc.docId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doc.documentType === 'OTHER' ? doc.documentTitle : doc.documentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.originalFileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleDelete(doc.docId)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-between border-t mt-8">
        <button type="button" onClick={prevStep} className="px-6 py-2 border text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
          &larr; Back
        </button>
        <button onClick={handleContinue} className="px-6 py-2 bg-[#953002] text-white rounded-md font-medium shadow hover:bg-amber-800 transition-colors">
          Next Step &rarr;
        </button>
      </div>
    </div>
  );
}
