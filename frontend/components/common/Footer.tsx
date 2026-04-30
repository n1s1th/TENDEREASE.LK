"use client";

import React from "react";
import { Shield, Mail, Globe, Copyright } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm px-8 py-8">
      <div className="max-w-[98%] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#953002] flex items-center justify-center shadow-lg shadow-[#953002]/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-gray-900 tracking-tight">TENDEREASE.LK</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Secure Procurement Portal</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex items-center gap-8">
          <a href="mailto:support@tenderease.lk" className="flex items-center gap-2 text-gray-500 hover:text-[#953002] transition-colors text-[12px] font-bold uppercase tracking-widest">
            <Mail className="w-4 h-4" />
            Support
          </a>
          <a href="https://tenderease.lk" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-[#953002] transition-colors text-[12px] font-bold uppercase tracking-widest">
            <Globe className="w-4 h-4" />
            Website
          </a>
        </div>

        {/* Copyright Section */}
        <div className="flex items-center gap-2 text-gray-400">
          <Copyright className="w-4 h-4" />
          <span className="text-[12px] font-bold uppercase tracking-widest">
            {currentYear} <span className="text-gray-900">TENDEREASE.LK</span>. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  );
}
