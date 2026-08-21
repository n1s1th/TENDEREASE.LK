"use client";

import { User, Mail, Phone, Building, ExternalLink, ShieldCheck } from "lucide-react";

export default function ContactTab({ contact }: any) {
  if (!contact || contact.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 bg-gray-5/50 border border-dashed border-gray-100 rounded-[2rem]">
        <div className="w-16 h-16 bg-gray-5 rounded-full flex items-center justify-center mx-auto text-gray-3">
          <User size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-black-1">No Contacts Listed</h3>
          <p className="text-sm text-gray-3">There are no official contact persons listed for this tender.</p>
        </div>
      </div>
    );
  }

  const contactData = contact;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="space-y-1 px-2">
        <h2 className="text-2xl font-black text-black-1 tracking-tight">Official Contacts</h2>
        <p className="text-sm font-medium text-gray-3">Authorized personnel for inquiries and clarifications related to this tender.</p>
      </div>

      <div className={`grid grid-cols-1 ${contactData.length > 1 ? "md:grid-cols-2" : "max-w-2xl"}`}>
        {contactData.map((c: any, index: number) => (
          <div key={index} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-premium hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:border-primary/10 transition-all duration-300 group relative overflow-hidden">
            {/* Decorative Background Element using Brand Secondary */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gray-5 border border-gray-100 flex items-center justify-center text-gray-3 shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:rotate-3 transition-all duration-500 shadow-sm">
                <User size={40} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-6 flex-1 text-center sm:text-left">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-black-1 group-hover:text-primary transition-colors uppercase tracking-tight">{c.officerName}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{c.designation}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-widest">
                      <ShieldCheck size={12} />
                      Verified
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 pt-6 border-t border-gray-5">
                  <a href={`mailto:${c.email}`} className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-2 font-bold hover:text-primary transition-all group/link">
                    <div className="p-2 bg-gray-5 rounded-lg group-hover/link:bg-primary/5 transition-colors">
                      <Mail size={16} />
                    </div>
                    <span className="border-b-2 border-transparent group-hover/link:border-primary/20">{c.email}</span>
                  </a>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-2 font-bold group/link">
                    <div className="p-2 bg-gray-5 rounded-lg">
                      <Phone size={16} />
                    </div>
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-2 font-bold group/link">
                    <div className="p-2 bg-gray-5 rounded-lg">
                      <Building size={16} />
                    </div>
                    <span className="leading-tight">{c.department || "Ministry Office"}</span>
                  </div>
                </div>

                <button className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-3 hover:text-primary transition-all pt-4">
                  <span>View Full Profile</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}