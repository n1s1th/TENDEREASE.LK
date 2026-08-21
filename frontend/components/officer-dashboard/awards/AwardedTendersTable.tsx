"use client";

import { useEffect, useState } from "react";
import { useAwardProcessingStore, AwardTender, AwardBidder } from "@/store/award-processing.store";
import { ChevronDown, ChevronUp, Trophy, Clock } from "lucide-react";

interface SentEntry {
  winner: boolean;
  lost: boolean;
  winnerSentAt?: string;
  lostSentAt?: string;
}

interface AwardedTenderRow {
  tender: AwardTender;
  awardedAt: string; // ISO timestamp of the final email sent
}

export default function AwardedTendersTable() {
  const { tenders } = useAwardProcessingStore();
  const [awardedTenders, setAwardedTenders] = useState<AwardedTenderRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedBidders, setExpandedBidders] = useState<AwardBidder[]>([]);
  const [loadingBidders, setLoadingBidders] = useState(false);

  useEffect(() => {
    const loadAwarded = () => {
      const raw = localStorage.getItem("awardEmailsSent");
      if (!raw) return;

      try {
        const sentMap: Record<string, SentEntry> = JSON.parse(raw);
        const rows: AwardedTenderRow[] = [];

        for (const tender of tenders) {
          const entry = sentMap[tender.id];
          if (!entry) continue;

          if (entry.winner) {
            const timestamps = [entry.winnerSentAt, entry.lostSentAt].filter(Boolean) as string[];
            const awardedAt = timestamps.length > 0
              ? timestamps.sort().reverse()[0] 
              : new Date().toISOString();

            rows.push({ tender, awardedAt });
          }
        }

        rows.sort((a, b) => new Date(b.awardedAt).getTime() - new Date(a.awardedAt).getTime());
        setAwardedTenders(rows);
      } catch { }
    };

    loadAwarded();
    window.addEventListener('awardEmailsUpdated', loadAwarded);
    window.addEventListener('storage', loadAwarded);

    return () => {
      window.removeEventListener('awardEmailsUpdated', loadAwarded);
      window.removeEventListener('storage', loadAwarded);
    };
  }, [tenders]);

  const handleToggleExpand = async (tenderId: string) => {
    if (expandedId === tenderId) {
      setExpandedId(null);
      setExpandedBidders([]);
      return;
    }

    setExpandedId(tenderId);
    setLoadingBidders(true);
    try {
      const res = await fetch(`http://localhost:8084/api/evaluations/mock/awards/tenders/${tenderId}/bidders`);
      if (res.ok) {
        const data = await res.json();
        setExpandedBidders(data);
      }
    } catch (e) {
      console.error(e);
      setExpandedBidders([]);
    } finally {
      setLoadingBidders(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }) + " at " + d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (awardedTenders.length === 0) {
    return null; // Don't render section if no awarded tenders
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-5 border-b border-gray-100 bg-[#FAF9F6] rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#953002]/10 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#953002]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-[15px]">Awarded Tenders</h3>
            <p className="text-xs text-gray-500 mt-0.5">Tenders with all notification emails sent to bidders</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
            <tr>
              <th className="px-5 py-3">Tender No</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Awarded At</th>
              <th className="px-5 py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {awardedTenders.map(({ tender, awardedAt }) => (
              <> 
                <tr key={tender.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#953002] text-xs">{tender.tenderNo}</span>
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-800 max-w-[200px] truncate">{tender.title}</td>
                  <td className="px-5 py-4 text-gray-600">{tender.department}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      Awarded
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center text-xs text-gray-600">
                      {formatDate(awardedAt)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleExpand(tender.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#953002] hover:text-[#7a2701] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#953002]/5"
                    >
                      {expandedId === tender.id ? (
                        <>Hide <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>View More <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </td>
                </tr>

                {expandedId === tender.id && (
                  <tr key={`${tender.id}-detail`}>
                    <td colSpan={6} className="px-5 py-4 bg-gray-50/50">
                      {loadingBidders ? (
                        <div className="text-sm text-gray-500 text-center py-4">Loading bidder details...</div>
                      ) : expandedBidders.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-4">No bidder data available.</div>
                      ) : (
                        <div className="space-y-3">
                          {[...expandedBidders].sort((a, b) => a.status === 'WINNER' ? -1 : (b.status === 'WINNER' ? 1 : 0)).map((bidder) => (
                            <div
                              key={bidder.bidderId}
                              className={`rounded-lg border p-4 ${
                                bidder.status === "WINNER"
                                  ? "border-emerald-200 bg-emerald-50/40"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 text-sm">{bidder.bidderName}</h4>
                                  {bidder.status === "WINNER" ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                      WINNER
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                      UNSUCCESSFUL
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-8 text-xs">
                                <div>
                                  <span className="text-gray-500 font-medium">Bidder ID: </span>
                                  <span className="text-gray-700 font-bold">{bidder.bidderId.substring(0, 8)}...</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">Email: </span>
                                  <span className="text-gray-700 font-bold">{bidder.bidderEmail || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">Score: </span>
                                  <span className={`font-bold ${bidder.status === "WINNER" ? "text-emerald-700" : "text-gray-700"}`}>
                                    {bidder.score}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">Bid Amount: </span>
                                  <span className="text-gray-700 font-bold">LKR {bidder.bidAmount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
