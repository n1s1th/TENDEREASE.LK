"use client";

import Image from "next/image";
import { User } from "lucide-react";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="w-full bg-white border-b shadow-sm">

      <div className="max-w-[1600px] mx-auto px-6 py-5 flex justify-between items-center">

        {/* Left */}
        <Link href="/" className="flex items-center gap-4 cursor-pointer">

          <Image
            src="/assets/logo.png"
            alt="TenderEase Logo"
            width={70}
            height={70}
            priority
          />

          <div className="leading-tight">
            <h1 className="text-xl font-semibold text-gray-900">
              TenderEase.lk
            </h1>
            <p className="text-sm text-gray-500">
              Sri Lanka Government Tendering & Bidding Platform
            </p>
          </div>

        </Link>

        {/* Right */}
        <Link
          href="/account"
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-700 transition cursor-pointer"
        >
          <User size={18} />
          My Account
        </Link>

      </div>

    </header>
  );
}
