import GlobalTopNavigation from "@/components/common/GlobalTopNavigation";
import AppHeader from "@/components/common/AppHeader";
import App from "next/app";

export default function HomePage() {
  return (
    <>
      <GlobalTopNavigation />

      <div className="px-6 py-10">
        <h1 className="text-2xl font-semibold">
          Tender Search Page
        </h1>

        <p className="text-gray-600 mt-2">
          This is your landing/search page.
        </p>
      </div>
    </>
  );
}
