import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import LatestTenders from "@/components/home/LatestTenders";
import HowItWorks from "@/components/home/HowItWorks";
import CoreFeatures from "@/components/home/CoreFeatures";
import NewsSection from "@/components/home/NewsSection";
import GuideVideos from "@/components/home/GuideVideos";
import Footer from "@/components/home/Footer";

export default function HomePage() {
  return (
    <div className="home-page">
      {/* <Navbar /> */}
      <HeroSection />
      <LatestTenders />
      <HowItWorks />
      <CoreFeatures />
      <NewsSection />
      <GuideVideos />
      <Footer />
    </div>
  );
}
