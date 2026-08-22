"use client";

import { User, Mail, Phone, Building, ExternalLink, ShieldCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContactTab({ contact }: any) {
  if (!contact || contact.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-grey-1 flex items-center justify-center mb-4 text-muted-foreground">
            <User size={24} />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No Contacts Listed</h3>
          <p className="text-sm text-muted-foreground max-w-sm">There are no official contact persons listed for this tender.</p>
        </CardContent>
      </Card>
    );
  }

  const contactData = contact;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle>Official Contacts</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className={`grid grid-cols-1 ${contactData.length > 1 ? "md:grid-cols-2" : "max-w-xl"} gap-6`}>
            {contactData.map((c: any, index: number) => (
              <div key={index} className="rounded-md border border-border bg-white p-6 shadow-sm hover:border-primary/30 transition-colors group relative overflow-hidden flex flex-col gap-6">
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-md bg-grey-1 border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <User size={32} strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-4 flex-1 text-center sm:text-left">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{c.officerName}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded border border-primary/10">{c.designation}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-success uppercase tracking-wider">
                          <ShieldCheck size={12} />
                          Verified
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 pt-4 border-t border-border">
                      <a href={`mailto:${c.email}`} className="flex items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground font-medium hover:text-primary transition-colors group/link">
                        <Mail size={16} />
                        <span className="border-b border-transparent group-hover/link:border-primary/20">{c.email}</span>
                      </a>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground font-medium">
                        <Phone size={16} />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-muted-foreground font-medium">
                        <Building size={16} />
                        <span className="leading-tight">{c.department || "Ministry Office"}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}