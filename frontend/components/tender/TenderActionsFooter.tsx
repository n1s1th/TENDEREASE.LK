import Link from "next/link";

export default function TenderActionsFooter({ tenderId }: { tenderId: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex justify-between items-center shadow-sm">
      <button className="px-10 py-3 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-all">
        Save for Later
      </button>

      <div className="flex gap-4">
        <button className="px-10 py-3 rounded-xl border border-gray-200 text-gray-900 font-bold text-sm hover:bg-gray-50 transition-all">
          Print details
        </button>
        {tenderId ? (
          <Link href={`/tenders/${tenderId}/apply`}>
            <button className="px-12 py-3 rounded-xl bg-[#a03d11] text-white font-bold text-sm hover:bg-[#8a330e] transition-all hover:shadow-lg active:scale-95">
              Submit Bid
            </button>
          </Link>
        ) : (
          <button className="px-12 py-3 rounded-xl bg-[#a03d11] text-white font-bold text-sm opacity-50 cursor-not-allowed">
            Submit Bid
          </button>
        )}
      </div>
    </div>
  );
}
