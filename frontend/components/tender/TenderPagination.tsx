"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function TenderPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: Props) {
  const startItem = (currentPage - 1) * 10 + 1; // Assuming size 10 from service
  const endItem = Math.min(currentPage * 10, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-6 p-6 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Left Side Text */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
        <p className="text-sm font-bold text-gray-2 uppercase tracking-widest text-[10px]">
          Showing <span className="text-black-1">{startItem} – {endItem}</span> of <span className="text-black-1">{totalItems}</span> Tenders
        </p>
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl text-lg font-bold text-gray-3 transition-all hover:bg-gray-5 hover:text-black-1 disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
        >
          ‹
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  w-10 h-10 rounded-xl text-xs font-black transition-all duration-300 border
                  ${isActive 
                    ? "bg-primary text-white border-primary shadow-primary" 
                    : "bg-white text-gray-3 border-gray-100 hover:bg-gray-5 hover:text-black-1"
                  }
                  active:scale-90
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-xl text-lg font-bold text-gray-3 transition-all hover:bg-gray-5 hover:text-black-1 disabled:opacity-20 disabled:cursor-not-allowed active:scale-90"
        >
          ›
        </button>

      </div>
    </div>
  );
}
