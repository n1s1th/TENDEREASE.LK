import { useEffect, useState, useRef } from "react";
import { useAwardProcessingStore } from "@/store/award-processing.store";
import { useOfficerDashboardStore } from "@/store/officer-dashboard/officer-dashboard.store";
import { useAuthStore } from "@/store/auth/auth.store";
import { AlertCircle, Loader2, X, MousePointerClick } from "lucide-react";

export default function AwardProcessingDetail({ tenderId }: { tenderId: string | null }) {
  const user = useAuthStore(state => state.user);
  const officerEmail = user?.email || user?.username || "officer@procurement.gov.lk";

  const { tenders, bidders, loadingBidders, fetchBidders, generateEmails, generatingEmails } = useAwardProcessingStore();
  const showToast = useOfficerDashboardStore(state => state.showToast);
  
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailType, setEmailType] = useState<'WINNER' | 'LOST' | null>(null);
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);

  // Persist email sent status in localStorage
  const getSentStatus = (): Record<string, { winner: boolean; lost: boolean; winnerSentAt?: string; lostSentAt?: string }> => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('awardEmailsSent') || '{}');
    } catch { return {}; }
  };
  const [sentStatus, setSentStatus] = useState<Record<string, { winner: boolean; lost: boolean; winnerSentAt?: string; lostSentAt?: string }>>(getSentStatus);
  
  // Email form state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailClosing, setEmailClosing] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  // Inline validation errors
  const [formErrors, setFormErrors] = useState<{ subject?: string; closing?: string }>({});

  useEffect(() => {
    if (tenderId) {
      fetchBidders(tenderId);
    }
  }, [tenderId, fetchBidders]);

  const tender = tenderId ? tenders.find(t => t.id === tenderId) : undefined;
  const winner = bidders.find(b => b.status === 'WINNER');
  const losers = bidders.filter(b => b.status === 'LOST');
  
  const tenderSentStatus = tenderId 
    ? (sentStatus[tenderId] || { winner: false, lost: false }) 
    : { winner: false, lost: false };

  // Auto-heal: If all necessary emails are marked as sent in localStorage but it's not fullyAwarded
  useEffect(() => {
    if (!tenderId || !tender || loadingBidders) return;
    const needsWinnerEmail = !!winner;
    const needsLoserEmail = losers.length > 0;
    
    const winnerDone = !needsWinnerEmail || tenderSentStatus.winner;
    const loserDone = !needsLoserEmail || tenderSentStatus.lost;
    if (winnerDone && loserDone && !(tenderSentStatus as any).fullyAwarded && (needsWinnerEmail || needsLoserEmail)) {
      const updatedStatus = { ...tenderSentStatus, fullyAwarded: true };
      const updated = { ...sentStatus, [tenderId]: updatedStatus };
      
      setSentStatus(updated);
      localStorage.setItem('awardEmailsSent', JSON.stringify(updated));
      window.dispatchEvent(new Event('awardEmailsUpdated'));
      
      if (tender.status !== 'AWARDED') {
        const currentUser = useAuthStore.getState().user;
        const currentOfficerEmail = currentUser?.email || currentUser?.username || "officer@procurement.gov.lk";
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/v1/tenders/${tenderId}/status?status=AWARDED&awardedBy=${encodeURIComponent(currentOfficerEmail)}`, { method: 'PUT' }).catch(console.error);
      }
    }
  }, [tenderId, tender, loadingBidders, winner, losers, tenderSentStatus, sentStatus]);

  if (!tenderId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <MousePointerClick className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Tender</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Select an evaluated tender from the list to view the winning bidder and generate award notifications.
        </p>
      </div>
    );
  }
  
  if (loadingBidders) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
      </div>
    );
  }

  const handleOpenModal = (type: 'WINNER' | 'LOST') => {
    setEmailType(type);
    setEmailClosing("Best Regards,\nProcurement Officer");
    setFormErrors({});
    
    let defaultBody = "";
    if (type === 'WINNER') {
      setEmailSubject(`Tender Award Notification - ${tender?.tenderNo}`);
      defaultBody = `Dear <b>${winner?.bidderName}</b>,<br/><br/>Congratulations! We are pleased to inform you that your bid for tender <b>${tender?.tenderNo}</b> (${tender?.title}) has been successful.<br/><br/>Your winning bid amount is <b>LKR ${winner?.bidAmount.toLocaleString()}</b>.<br/><br/>Our team will contact you shortly to finalize the contract details.`;
    } else {
      setEmailSubject(`Tender Evaluation Outcome - ${tender?.tenderNo}`);
      defaultBody = `Dear Bidder,<br/><br/>Thank you for participating in tender <b>${tender?.tenderNo}</b> (${tender?.title}).<br/><br/>After careful evaluation, we regret to inform you that your bid was not successful on this occasion.<br/><br/>We appreciate your effort and encourage you to participate in future opportunities.`;
    }
    
    setEmailBody(defaultBody);
    setEmailModalOpen(true);
    
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = defaultBody;
      }
    }, 10);
  };

  const handleSendEmails = async () => {
    if (!tenderId || !emailType) return;
    
    const errors: { subject?: string; closing?: string } = {};
    
    if (!emailSubject.trim()) {
      errors.subject = "Subject is required.";
    }
    
    if (!emailClosing.trim()) {
      errors.closing = "This field is required.";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});

    try {
      setIsGeneratingEmails(true);
      
      const recipients: string[] = [];
      if (emailType === 'WINNER') {
        if (winner?.bidderEmail) recipients.push(winner.bidderEmail);
      } else {
        losers.forEach(loser => {
          if (loser.bidderEmail) recipients.push(loser.bidderEmail);
        });
      }
      
      if (recipients.length === 0) {
        throw new Error("No valid email addresses found for the selected bidders.");
      }
      
      const formattedClosing = emailClosing.replace(/\n/g, '<br/>');
      const fullHtmlBody = `
<div style="background-color: #f9fafb; color: #1f2937; font-family: 'Inter', Helvetica, Arial, sans-serif; padding: 40px 20px; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left; border: 1px solid #e5e7eb;">
    <div style="background-color: #953002; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">TenderEase</h1>
    </div>
    <div style="padding: 32px 24px; font-size: 15px; line-height: 1.6; color: #374151;">
      ${emailBody}
      <br/><br/>
      <div style="color: #6b7280; font-weight: 500;">
        ${formattedClosing}
      </div>
    </div>
    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">Please log in to the procurement dashboard to review details if necessary.</p>
    </div>
  </div>
</div>`;

      // Send to all recipients individually
      await Promise.all(recipients.map(async (recipientEmail) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8089'}/api/v1/notifications/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientEmail,
            subject: emailSubject,
            body: fullHtmlBody,
            isHtml: true
          })
        });
        
        if (!res.ok) {
          console.error(`Failed to send to ${recipientEmail}`);
          throw new Error("Failed to send email");
        }
      }));
      
    } catch (err: any) {
      console.error(err);
      setFormErrors({ subject: err.message || "Failed to send email. Please check backend configuration." });
      setIsGeneratingEmails(false);
      return;
    } finally {
      setIsGeneratingEmails(false);
    }
    
    const now = new Date().toISOString();
    
    // Check if we even need these emails
    const needsWinnerEmail = !!winner;
    const needsLoserEmail = losers.length > 0;
    
    const updatedStatus = {
      ...sentStatus[tenderId],
      winner: emailType === 'WINNER' ? true : sentStatus[tenderId]?.winner,
      lost: emailType === 'LOST' ? true : sentStatus[tenderId]?.lost,
      winnerSentAt: emailType === 'WINNER' ? now : sentStatus[tenderId]?.winnerSentAt,
      lostSentAt: emailType === 'LOST' ? now : sentStatus[tenderId]?.lostSentAt,
    };
    
    // Check if fully awarded (all required emails sent)
    const winnerDone = !needsWinnerEmail || updatedStatus.winner;
    const loserDone = !needsLoserEmail || updatedStatus.lost;
    
    if (winnerDone && loserDone) {
      (updatedStatus as any).fullyAwarded = true;
    }

    const updated = {
      ...sentStatus,
      [tenderId]: updatedStatus
    };
    
    setSentStatus(updated);
    localStorage.setItem('awardEmailsSent', JSON.stringify(updated));
    window.dispatchEvent(new Event('awardEmailsUpdated'));

    // Check if both emails are now sent, update the database
    if ((updatedStatus as any).fullyAwarded) {
      try {
        const currentUser = useAuthStore.getState().user;
        const currentOfficerEmail = currentUser?.email || currentUser?.username || "officer@procurement.gov.lk";
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/api/v1/tenders/${tenderId}/status?status=AWARDED&awardedBy=${encodeURIComponent(currentOfficerEmail)}`, {
          method: 'PUT'
        });
        useAwardProcessingStore.getState().fetchTenders();
      } catch (err) {
        console.error("Failed to update tender status to AWARDED in database", err);
      }
    }
    
    showToast('success', "Email sent successfully.");
    setEmailModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
        <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-[#FAF9F6] rounded-t-xl">
          <div>
            <span className="text-xs font-bold text-[#953002] tracking-wider uppercase">{tender?.tenderNo}</span>
            <h2 className="text-xl font-black text-gray-900 mt-1">{tender?.title}</h2>
            {tender?.status === 'PENDING_CAO' && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                Evaluation Completed. Waiting for CAO Approval.
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Winning Bidder Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2">
                Winning Bidder
              </h3>
              {tender && winner && (
                <button 
                  onClick={() => handleOpenModal('WINNER')}
                  disabled={generatingEmails || tenderSentStatus.winner}
                  className="flex items-center gap-2 px-4 py-2 bg-[#953002] hover:bg-[#7a2701] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {generatingEmails && <Loader2 className="w-4 h-4 animate-spin" />}
                  {tenderSentStatus.winner ? "Email Sent" : "Generate Award Email"}
                </button>
              )}
            </div>
            
            {winner ? (
              <div className="border border-gray-200 rounded-xl p-5">
                <h4 className="font-bold text-gray-900 text-lg mb-4">{winner.bidderName}</h4>
                <div className="flex">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Bidder ID</p>
                    <p className="font-bold text-gray-700 text-sm mt-1 truncate" title={winner.bidderId}>{winner.bidderId.substring(0, 8)}...</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email</p>
                    <p className="font-bold text-gray-700 text-sm mt-1 truncate" title={winner.bidderEmail || 'N/A'}>{winner.bidderEmail || 'N/A'}</p>
                  </div>
                  <div className="flex-1 whitespace-nowrap">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Final Score</p>
                    <p className="font-black text-emerald-700 text-lg mt-0.5">{winner.score}%</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Bid Amount</p>
                    <p className="font-black text-gray-800 text-lg mt-0.5">LKR {winner.bidAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 text-center">
                No winning bidder identified yet.
              </div>
            )}
          </section>

          {/* Unsuccessful Bidders Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2">
                Unsuccessful Bidders
              </h3>
              {tender && losers.length > 0 && (
                <button 
                  onClick={() => handleOpenModal('LOST')}
                  disabled={generatingEmails || tenderSentStatus.lost}
                  className="flex items-center gap-2 px-4 py-2 bg-[#953002] hover:bg-[#7a2701] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {generatingEmails && <Loader2 className="w-4 h-4 animate-spin" />}
                  {tenderSentStatus.lost ? "Emails Sent" : "Generate Rejection Emails"}
                </button>
              )}
            </div>

            {losers.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3">Bidder Name</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3 text-right">Bid Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {losers.map((loser) => (
                      <tr key={loser.bidderId} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{loser.bidderName}</td>
                        <td className="px-4 py-3 text-gray-600 font-medium">{loser.score}%</td>
                        <td className="px-4 py-3 text-right text-gray-600">LKR {loser.bidAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-200 rounded-xl text-sm text-gray-500 text-center">
                No unsuccessful bidders found.
              </div>
            )}
          </section>
        </div>
      </div>

      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">
                {emailType === 'WINNER' ? 'Award Notification Email' : 'Rejection Notification Emails'}
              </h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {emailType === 'WINNER' 
                    ? winner ? (winner.bidderEmail || winner.bidderName) : 'Winner'
                    : losers.length > 0 ? losers.map(l => l.bidderEmail || l.bidderName).join(', ') : 'Unsuccessful Bidders'
                  }
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => {
                    setEmailSubject(e.target.value);
                    if (formErrors.subject) setFormErrors(prev => ({ ...prev, subject: undefined }));
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] ${
                    formErrors.subject ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {formErrors.subject && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.subject}</p>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message Body</label>
                <div 
                  ref={editorRef}
                  contentEditable
                  onBlur={(e) => setEmailBody(e.currentTarget.innerHTML)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] min-h-[200px]"
                />
                <p className="text-[10px] text-gray-400 mt-1">You can edit the text above. Formatting (bold, italics) is supported.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Closing (Sign-off) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={emailClosing}
                  onChange={(e) => {
                    setEmailClosing(e.target.value);
                    if (formErrors.closing) setFormErrors(prev => ({ ...prev, closing: undefined }));
                  }}
                  placeholder="[Add your email]"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] ${
                    formErrors.closing ? 'border-red-400 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {formErrors.closing && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{formErrors.closing}</p>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setEmailModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmails}
                disabled={isGeneratingEmails}
                className="px-5 py-2 text-sm font-bold text-white bg-[#953002] hover:bg-[#7a2701] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingEmails ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <>Send Email</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
