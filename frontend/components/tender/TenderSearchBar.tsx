"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function TenderSearchBar() {
  const [keyword, setKeyword] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">

      {/* Top Search Row */}
      <div className="flex gap-4 items-center">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by Ref No, Title, Entity..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="
              w-full
              pl-12 pr-4 py-3
              rounded-xl
              border border-gray-200
              focus:outline-none
              focus:ring-2
              focus:ring-orange-500
              focus:border-orange-500
              transition
              text-sm
            "
          />
        </div>

        <button
          className="
            bg-orange-500
            text-white
            px-7 py-3
            rounded-xl
            text-sm font-medium
            cursor-pointer
            transition-all duration-200
            hover:bg-orange-600
            hover:shadow-md
            active:scale-95
          "
        >
          Search
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-end">

          {/* STATUS */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase">
              Status
            </label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer">
              <option>All</option>
              <option>Open</option>
              <option>Upcoming</option>
              <option>Closed</option>
            </select>
          </div>

          {/* DATE TYPE */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase">
              Date Type
            </label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer">
              <option>None</option>
              <option>Closing Date</option>
              <option>Published Date</option>
            </select>
          </div>

          {/* FROM */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase">
              From
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            />
          </div>

          {/* TO */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase">
              To
            </label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            />
          </div>

          {/* RESET */}
          <div className="flex justify-start lg:justify-end">
            <button
              className="
                border border-gray-300
                px-6 py-3
                rounded-xl
                text-sm font-medium
                cursor-pointer
                transition
                hover:bg-gray-100
                hover:border-gray-400
              "
            >
              Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
