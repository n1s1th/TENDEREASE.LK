import { ArrowRight, UserPlus, Search, FileText, Trophy, ShieldCheck, Clock, Play } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-primary" />,
    title: "1. Register your Business",
    description: "Create an account and submit your business registration details. Our team will verify your credentials to ensure a trusted bidding environment.",
  },
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: "2. Find Opportunities",
    description: "Search and filter through open government tenders. Set up alerts for your specific industry or category so you never miss a deadline.",
  },
  {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "3. Prepare & Submit Bids",
    description: "Download bidding documents, ask questions via our Q&A system, and submit your technical and financial proposals securely online.",
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: "4. Track & Win",
    description: "Track the status of your submitted bids in real-time. If successful, you will receive official award letters directly through the platform.",
  }
];

const videos = [
  {
    title: "How to Register your Business",
    duration: "2:15",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Finding & Applying for Tenders",
    duration: "4:30",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Navigating your Dashboard",
    duration: "3:45",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  }
];

const features = [
  {
    title: "Transparent Process",
    icon: <ShieldCheck className="w-5 h-5 text-success" />,
    desc: "Every step is logged and auditable, ensuring fair play and complete transparency in government procurement."
  },
  {
    title: "Save Time",
    icon: <Clock className="w-5 h-5 text-warning" />,
    desc: "No more physical paperwork. Handle all your tender submissions, clarifications, and awards completely online."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-border py-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-block bg-primary/10 text-primary font-bold tracking-widest uppercase text-[10px] px-3 py-1 rounded-full mb-4 border border-primary/20">
            Platform Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            How <span className="text-primary">TenderEase</span> Works
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            TenderEase is a centralized, digital platform that simplifies the Sri Lankan government procurement process for both vendors and procurement officers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16 space-y-20">
        
        {/* Step-by-Step */}
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, idx) => (
            <Card key={idx} className="border-border hover:border-primary/20 transition-colors">
              <CardContent className="p-8 flex flex-col gap-5">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                  {step.icon}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Tutorials */}
        <div className="space-y-8 pt-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-foreground">Video Tutorials</h2>
            <p className="text-muted-foreground font-medium">Watch these short guides to see how the platform works in action.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((video, idx) => (
              <Card key={idx} className="border-border overflow-hidden group cursor-pointer hover:border-primary/30 hover:shadow-md transition-all">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-primary ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground line-clamp-1">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="bg-white border border-border p-6 rounded-xl flex items-start gap-4">
              <div className="mt-1 p-2 bg-muted rounded-md">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-3xl p-10 md:p-16 border border-primary/10 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-black text-foreground">Ready to start bidding?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join hundreds of other vendors who are already successfully securing government contracts through TenderEase.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/tenders" className="w-full sm:w-auto">
                <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 rounded-lg font-bold transition-all w-full shadow-sm shadow-primary/20">
                  Browse Open Tenders
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
