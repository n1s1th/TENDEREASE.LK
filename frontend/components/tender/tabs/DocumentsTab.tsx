"use client";

import { FileText, Download, ShieldCheck, Clock } from "lucide-react";

export default function DocumentsTab({ documents }: any) {
  if (!documents || documents.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-gray-5/50 border border-dashed border-gray-100 rounded-[2rem]">
        <div className="w-16 h-16 bg-gray-5 rounded-full flex items-center justify-center mx-auto text-gray-3">
          <FileText size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-black-1">No Documents Available</h3>
          <p className="text-sm text-gray-3">There are no downloadable documents associated with this tender.</p>
        </div>
      </div>
    );
  }

  const documentsData = documents;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-black-1 tracking-tight">Tender Documents</h2>
          <p className="text-sm font-medium text-gray-3">Download and review all necessary documentation for your submission.</p>
        </div>
        <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-black-1 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-colors shadow-lg shadow-black-1/10 active:scale-95">
          <Download size={16} />
          Download All
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documentsData.map((d: any) => (
          <div 
            key={d.id} 
            className="flex items-center justify-between bg-white p-6 rounded-[1.5rem] border border-gray-100 hover:border-secondary/20 hover:shadow-premium transition-all duration-300 group"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/10 shadow-sm transition-transform group-hover:scale-105 group-hover:bg-secondary group-hover:text-black-1 group-hover:border-secondary duration-300">
                <FileText size={28} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-black-2 group-hover:text-primary transition-colors">
                  {d.documentName}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-3 uppercase tracking-widest">
                  <span>{d.documentType || "PDF"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-5"></span>
                  <span>{d.fileSize || "1.2 MB"}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-5"></span>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : "TBA"}</span>
                  </div>
                </div>
              </div>
            </div>

            <a
              href={d.downloadUrl || d.fileUrl || "#"}
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-5 text-gray-3 group-hover:bg-primary/10 group-hover:text-primary font-black text-xs uppercase tracking-widest transition-all hover:shadow-sm active:scale-95"
            >
              <Download size={16} />
              <span>Download</span>
            </a>
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="bg-info/5 border border-info/10 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={80} className="text-info" />
        </div>
        <div className="relative z-10 flex gap-4 items-start">
          <div className="p-2 bg-info/10 rounded-lg text-info mt-1">
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black text-info uppercase tracking-widest">Submission Integrity</h4>
            <p className="text-sm font-bold text-info/70 leading-relaxed max-w-3xl">
              All documents are cryptographically signed. Any modification to the downloaded files will invalidate your submission. Ensure you have the latest versions before final upload.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}