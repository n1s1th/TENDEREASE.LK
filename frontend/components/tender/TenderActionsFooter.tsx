export default function TenderActionsFooter() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
      <button className="px-10 py-3 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-all">
        Save for Later
      </button>

      <button className="px-12 py-3 rounded-xl bg-[#a03d11] text-white font-bold text-sm hover:bg-[#8a330e] transition-all hover:shadow-lg active:scale-95">
        APPLY NOW
      </button>
    </div>
  );
}

