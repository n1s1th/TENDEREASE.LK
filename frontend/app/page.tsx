import GlobalTopNavigation from "@/components/common/GlobalTopNavigation";
import AppHeader from "@/components/common/AppHeader";
import App from "next/app";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="home-page">
      <Navbar />
      {/* Hero, Features, and other sections will go here */}
    </div>
  );
}
