import { User } from "lucide-react";

export default function MainHeader() {
  return (
    <div className="bg-white border-b">
      <div className="w-full px-3 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="border w-5 h-5 flex items-center justify-center text-xs font-bold">
            ✕
          </div>
          <div>
            <p className="font-semibold">TenderEase</p>
            <p className="text-xs text-gray-500">for Figma</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:underline text-sm">
          <User size={16} />
          My Account
        </div>
      </div>
    </div>
  );
}
