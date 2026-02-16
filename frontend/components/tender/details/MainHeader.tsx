export default function MainHeader() {
  return (
    <div className="bg-white border-b">

      <div className="w-full px-4 py-3 flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="border border-gray-400 w-5 h-5 flex items-center justify-center text-xs font-bold">
            ✕
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-gray-800">
              TenderEase
            </p>
            <p className="text-xs text-gray-500">
              for Figma
            </p>
          </div>
        </div>

        {/* My Account */}
        <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:underline">
          <span>👤</span>
          My Account
        </div>

      </div>
    </div>
  );
}
