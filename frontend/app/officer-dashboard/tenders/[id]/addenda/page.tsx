"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, UploadCloud, Clock, CheckCircle2, FileText, Download, AlertCircle } from "lucide-react";
import { getTenderById, createAddendum, uploadAddendumVersion, getAddendumVersions, getAddenda } from "@/services/tender.service";
import { useAuthStore } from "@/store";

export default function OfficerAddendaManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tender, setTender] = useState<any>(null);
  const [amendments, setAmendments] = useState<any[]>([]);
  const [tenderId, setTenderId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Forms states
  const [newAddendum, setNewAddendum] = useState({ title: "", description: "", file: null as File | null });
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  
  // Version upload states
  const [uploadingVersionForId, setUploadingVersionForId] = useState<number | null>(null);
  const [newVersion, setNewVersion] = useState({ changeDescription: "", file: null as File | null });

  // History viewer state
  const [historyForId, setHistoryForId] = useState<number | null>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setTenderId(p.id);
      fetchTenderData(p.id);
    });
  }, [params]);

  const fetchTenderData = async (id: string) => {
    setLoading(true);
    try {
      const [tenderData, addendaData] = await Promise.all([
        getTenderById(id),
        getAddenda(id).catch(() => []),
      ]);
      setTender(tenderData);
      // getAddenda returns the raw response; normalise to array
      const addendaArray = Array.isArray(addendaData)
        ? addendaData
        : (addendaData as any)?.data ?? [];
      setAmendments(addendaArray);
    } catch (error) {
      console.error("Failed to fetch tender", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddendum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddendum.title) return alert("Title is required");
    
    setIsSubmittingNew(true);
    try {
      const formData = new FormData();
      formData.append("title", newAddendum.title);
      if (newAddendum.description) formData.append("description", newAddendum.description);
      if (newAddendum.file) formData.append("file", newAddendum.file);

      await createAddendum(tenderId, formData);
      setNewAddendum({ title: "", description: "", file: null });
      fetchTenderData(tenderId); // refresh

    } catch (error) {
      alert("Failed to create addendum.");
      console.error(error);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const handleUploadVersion = async (e: React.FormEvent, addendumId: number) => {
    e.preventDefault();
    if (!newVersion.file) return alert("File is required for a new version");

    setUploadingVersionForId(addendumId); // Show loader for this specific addendum
    try {
      const formData = new FormData();
      formData.append("file", newVersion.file);
      if (newVersion.changeDescription) formData.append("changeDescription", newVersion.changeDescription);

      await uploadAddendumVersion(tenderId, addendumId, formData);
      setNewVersion({ changeDescription: "", file: null });
      setUploadingVersionForId(null);
      fetchTenderData(tenderId); // refresh

    } catch (error) {
      alert("Failed to upload new version.");
      console.error(error);
      setUploadingVersionForId(null);
    }
  };

  const loadHistory = async (addendumId: number) => {
    if (historyForId === addendumId) {
      setHistoryForId(null); // toggle off
      return;
    }
    setHistoryForId(addendumId);
    setLoadingHistory(true);
    try {
      const history = await getAddendumVersions(tenderId, addendumId);
      setVersionHistory(history || []);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center font-inter">
        <div className="w-8 h-8 border-4 border-[#953002] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] p-8 text-center font-inter">
        <h1 className="text-2xl font-black text-gray-900">Tender Not Found</h1>
      </div>
    );
  }

  // Allow addenda on all active statuses; block only after award/close
  const BLOCKED_STATUSES = ["AWARDED", "CLOSED", "CANCELLED", "NO_BID"];
  const isUpdatable = !BLOCKED_STATUSES.includes(tender.status);

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-inter pt-8 px-4 sm:px-6">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 py-4">
          <button 
            onClick={() => router.push("/officer-dashboard")}
            className="p-2 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-[22px] font-black text-gray-900 tracking-tight uppercase">Manage Addenda</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">{tender.tenderNumber ?? tender.tenderNo} - {tender.title}</p>
          </div>
        </div>

        {!isUpdatable && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">Read-Only Mode</h3>
              <p className="text-sm text-red-700 mt-1 font-medium">Addenda cannot be created or updated because this tender has already reached the <span className="font-bold">{tender.status}</span> stage.</p>
            </div>
          </div>
        )}

        {/* Existing Addenda List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[15px] font-black text-gray-900 uppercase tracking-widest">Existing Addenda</h2>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{amendments.length} Total</span>
          </div>
          
          <div className="p-6 space-y-6">
            {amendments.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-bold">No addenda have been published for this tender yet.</p>
              </div>
            ) : (
              amendments.map((addendum: any) => (
                <div key={addendum.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md hover:border-[#953002]/20">
                  <div className="p-5 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 gap-4">
                    <div>
                      <h3 className="font-black text-gray-900 flex items-center gap-2 text-[15px]">
                        <FileText className="w-4 h-4 text-[#953002]" />
                        Addendum {String(addendum.amendmentNumber).padStart(3, "0")} - {addendum.title}
                      </h3>
                      {addendum.description && (
                        <p className="text-[13px] text-gray-500 mt-1.5 font-medium">{addendum.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 bg-[#953002]/10 text-[#953002] rounded-full text-[11px] font-black tracking-widest uppercase">
                        Current: v{addendum.currentVersionNumber}
                      </div>
                      <button 
                        onClick={() => loadHistory(addendum.id)}
                        className={`px-4 py-1.5 border rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all ${
                          historyForId === addendum.id 
                          ? "bg-gray-900 text-white border-gray-900" 
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {historyForId === addendum.id ? "Hide History" : "View History"}
                      </button>
                    </div>
                  </div>

                  {/* Inline Version Upload Form */}
                  {isUpdatable && (
                    <div className="p-5 border-b border-gray-100 bg-orange-50/30">
                      <form onSubmit={(e) => handleUploadVersion(e, addendum.id)} className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-black text-[#953002] uppercase tracking-widest mb-2">Upload New Version (v{addendum.currentVersionNumber + 1})</label>
                          <input 
                            type="file" 
                            required
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-white file:border-gray-200 file:border file:text-gray-700 hover:file:bg-gray-50 cursor-pointer outline-none focus:ring-2 focus:ring-[#953002]/20"
                            onChange={(e) => setNewVersion({ ...newVersion, file: e.target.files?.[0] || null })}
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Change Description (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Corrected BOQ quantities" 
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#953002]/20 outline-none placeholder:text-gray-400 placeholder:font-normal"
                            value={newVersion.changeDescription}
                            onChange={(e) => setNewVersion({ ...newVersion, changeDescription: e.target.value })}
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={uploadingVersionForId === addendum.id}
                          className="px-5 py-2.5 w-full sm:w-auto bg-gray-900 text-white text-[12px] uppercase tracking-widest font-black rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
                        >
                          {uploadingVersionForId === addendum.id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <UploadCloud className="w-4 h-4" />
                          )}
                          Upload v{addendum.currentVersionNumber + 1}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* History View */}
                  {historyForId === addendum.id && (
                    <div className="p-5 bg-[#1e293b] text-white rounded-b-2xl overflow-hidden">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Version History Log
                      </h4>
                      {loadingHistory ? (
                        <div className="w-6 h-6 border-2 border-[#953002] border-t-transparent rounded-full animate-spin my-6 mx-auto"></div>
                      ) : (
                        <div className="space-y-3">
                          {versionHistory.map((vh) => (
                            <div key={vh.versionNumber} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 px-5 py-4 rounded-xl border border-white/10 gap-4 hover:bg-white/10 transition-colors">
                              <div>
                                <div className="flex items-center gap-3 mb-1.5">
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${addendum.currentVersionNumber === vh.versionNumber ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                                    Version {vh.versionNumber} {addendum.currentVersionNumber === vh.versionNumber && " (Latest)"}
                                  </span>
                                  <span className="text-sm font-bold text-gray-100">{vh.originalFilename}</span>
                                </div>
                                <p className="text-[12px] font-medium text-gray-400">
                                  {vh.changeDescription ? `Changes: ${vh.changeDescription}` : "Initial upload"} <span className="mx-1">•</span> Uploaded on {new Date(vh.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <a 
                                href={vh.secureUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white hover:text-[#953002]"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create New Addendum Section */}
        {isUpdatable && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#953002]/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-[#953002]" />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-gray-900 uppercase tracking-widest">Draft New Addendum</h2>
                <p className="text-xs font-bold text-gray-500 mt-0.5">Publish a completely new addendum document for this tender (Starts at v1).</p>
              </div>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleCreateAddendum} className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest mb-2">Addendum Title <span className="text-[#953002]">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002]/30 outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="e.g. Addendum 01 - Submission Deadline Extension"
                    value={newAddendum.title}
                    onChange={(e) => setNewAddendum({ ...newAddendum, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest mb-2">Description <span className="text-gray-400 normal-case font-medium">(Optional)</span></label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002]/30 outline-none transition-all resize-none placeholder:text-gray-400 placeholder:font-normal"
                    placeholder="Briefly describe the purpose of this addendum..."
                    value={newAddendum.description}
                    onChange={(e) => setNewAddendum({ ...newAddendum, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 uppercase tracking-widest mb-2">Initial Document (v1)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 bg-[#FAF9F6] text-center relative overflow-hidden group hover:border-[#953002]/30 hover:bg-[#953002]/5 transition-all">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setNewAddendum({ ...newAddendum, file: e.target.files?.[0] || null })}
                    />
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <UploadCloud className="w-8 h-8 text-gray-400 mb-3 group-hover:text-[#953002] transition-colors" />
                      <span className="text-[15px] font-black text-gray-900">
                        {newAddendum.file ? newAddendum.file.name : "Click to select or drag and drop a file"}
                      </span>
                      {!newAddendum.file && <span className="text-xs font-bold text-gray-500 mt-1">PDF, DOCX up to 10MB</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmittingNew}
                    className="px-8 py-4 bg-[#953002] text-white text-[13px] uppercase tracking-widest font-black rounded-xl hover:bg-gray-900 transition-all w-full flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmittingNew ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    Publish Addendum
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
