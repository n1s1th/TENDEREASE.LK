"use client";

import { Play, Clock, BookOpen } from "lucide-react";

const videos = [
  {
    id: "v1",
    title: "Getting Started with TenderEase",
    duration: "3:45",
    category: "Basics",
    thumbnail: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    accent: "#3b82f6"
  },
  {
    id: "v2",
    title: "How to Register as a Vendor",
    duration: "5:20",
    category: "Registration",
    thumbnail: "linear-gradient(135deg, #3f2b96 0%, #a8c0ff 100%)",
    accent: "#8b5cf6"
  },
  {
    id: "v3",
    title: "Submitting Your First Bid",
    duration: "4:15",
    category: "Bidding",
    thumbnail: "linear-gradient(135deg, #111827 0%, #953002 100%)",
    accent: "#f97316"
  },
  {
    id: "v4",
    title: "Understanding Clarifications",
    duration: "2:50",
    category: "Communication",
    thumbnail: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
    accent: "#10b981"
  }
];

export default function VideoTutorials() {
  return (
    <section className="py-20 px-6 relative bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-6 border border-primary/10">
            <BookOpen size={14} />
            <span>Tutorials</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-black-1 mb-4 tracking-tight">
            Watch & Learn
          </h2>
          <p className="text-gray-2 text-lg max-w-2xl mx-auto">
            Step-by-step video guides to help you navigate the platform, from registration to your first successful bid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="group relative rounded-[1.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 bg-white flex flex-col h-full"
            >
              {/* Thumbnail Area */}
              <div 
                className="relative aspect-video w-full overflow-hidden"
                style={{ background: video.thumbnail }}
              >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Play size={24} className="ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1.5 border border-white/10">
                  <Clock size={12} />
                  {video.duration}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div 
                  className="text-[10px] font-black uppercase tracking-wider mb-2"
                  style={{ color: video.accent }}
                >
                  {video.category}
                </div>
                <h3 className="text-black-1 font-bold text-base leading-snug group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
