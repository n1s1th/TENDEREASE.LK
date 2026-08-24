import { useEffect, useState } from "react";
import { useAwardProcessingStore } from "@/store/award-processing.store";
import { CheckCircle2, Clock, Search } from "lucide-react";

export default function AwardProcessingList({ 
  selectedTenderId, 
  onSelect 
}: { 
  selectedTenderId: string | null;
  onSelect: (id: string) => void;
}) {
  const { tenders, loadingTenders, fetchTenders } = useAwardProcessingStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [sentStatus, setSentStatus] = useState<Record<string, { winner: boolean; lost: boolean }>>({});

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  useEffect(() => {
    const loadSentStatus = () => {
      try {
        const raw = localStorage.getItem("awardEmailsSent");
        if (raw) setSentStatus(JSON.parse(raw));
      } catch { }
    };
    loadSentStatus();

    window.addEventListener('awardEmailsUpdated', loadSentStatus);
    window.addEventListener('storage', loadSentStatus);
    return () => {
      window.removeEventListener('awardEmailsUpdated', loadSentStatus);
      window.removeEventListener('storage', loadSentStatus);
    };
  }, []);

  if (loadingTenders) {
    return <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 animate-pulse">Loading tenders...</div>;
  }

  const filteredTenders = tenders.filter(t => {
    // If it's fully awarded in the DB, hide it from the evaluated list
    const isFullyAwarded = t.status === 'AWARDED';
      
    if (isFullyAwarded) return false;

    return t.tenderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
           t.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#FAF9F6] rounded-t-xl">
        <h3 className="font-bold text-gray-800 text-[15px]">Evaluated Tenders</h3>
      </div>
      
      <div className="p-3 border-b border-gray-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search tenders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#953002]/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredTenders.length === 0 ? (
          <div className="text-center p-6 text-sm text-gray-400">No evaluated tenders available.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTenders.map((tender) => (
              <button
                key={tender.id}
                onClick={() => onSelect(tender.id)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedTenderId === tender.id 
                    ? "bg-[#953002]/5 border-[#953002]/20" 
                    : "bg-white border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-gray-500">{tender.tenderNo}</span>
                  {tender.status === 'APPROVED' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> APPROVED
                    </span>
                  )}
                  {tender.status === 'PENDING_CAO' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> WAITING CAO
                    </span>
                  )}
                </div>
                <h4 className={`text-sm font-bold truncate ${selectedTenderId === tender.id ? "text-[#953002]" : "text-gray-800"}`}>
                  {tender.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 truncate">{tender.department}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
