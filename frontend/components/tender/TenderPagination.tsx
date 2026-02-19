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
  const startItem = (currentPage - 1) * 9 + 1;
  const endItem = Math.min(currentPage * 9, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">

      {/* Left Side Text */}
      <p className="text-sm text-gray-500">
        Showing {startItem} – {endItem} of {totalItems} tenders
      </p>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 border rounded-md text-sm disabled:opacity-40"
        >
          ‹
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
          const page = i + 1;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-md text-sm border transition
                ${
                  currentPage === page
                    ? "bg-orange-500 text-white border-orange-500"
                    : "hover:bg-gray-100"
                }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 border rounded-md text-sm disabled:opacity-40"
        >
          ›
        </button>

      </div>
    </div>
  );
}
