import HowItWorks from "@/components/home/HowItWorks";
import VideoTutorials from "@/components/how-it-works/VideoTutorials";
import Footer from "@/components/home/Footer";

export default function HowItWorksPage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen bg-[var(--te-gray-7)] pt-8">
      <div className="flex-1">
        <HowItWorks />
        <VideoTutorials />
      </div>
      <Footer />
    </main>
  );
}
