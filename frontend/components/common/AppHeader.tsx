"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, X, User, Menu, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tenders", href: "/tenders" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Help / FAQ", href: "/help" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  /* auto-focus the input when the search bar opens */
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  /* close mobile menu on route change */
  useEffect(() => {
  const id = setTimeout(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, 0);
  return () => clearTimeout(id);
}, [pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/tenders?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* ─── Main Header ──────────────────────────────────────────────────── */}
      <header
        className="
          fixed top-0 inset-x-0 z-50
          bg-white/80 backdrop-blur-lg
          border-b border-white/20
          shadow-[0_2px_24px_rgba(0,0,0,0.06)]
        "
      >
        {/* ── Top accent bar ── */}
        <div className="h-0.75 w-full bg-linear-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* ── Main row ── */}
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-orange-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                <Image
                  src="/assets/logo.png"
                  alt="TenderEase Logo"
                  width={44}
                  height={44}
                  priority
                  className="relative z-10 rounded-lg"
                />
              </div>
              <div className="leading-tight hidden sm:block">
                <span className="block text-base font-bold text-gray-900 tracking-tight">
                  TenderEase
                  <span className="text-orange-500">.lk</span>
                </span>
                <span className="block text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                  Gov Tendering &amp; Bidding
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? "text-orange-600 bg-orange-50"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/70"
                      }
                    `}
                  >
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-orange-500" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Search icon toggle */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Toggle search"
                className={`
                  p-2.5 rounded-xl transition-all duration-200 cursor-pointer
                  ${searchOpen
                    ? "bg-orange-100 text-orange-600"
                    : "text-gray-500 hover:bg-gray-100 hover:text-orange-600"
                  }
                `}
              >
                {searchOpen ? <X size={18} strokeWidth={2.2} /> : <Search size={18} strokeWidth={2.2} />}
              </button>

              {/* My Account */}
              <Link
                href="/account"
                className="
                  hidden sm:flex items-center gap-2
                  px-4 py-2 rounded-xl text-sm font-medium
                  bg-linear-to-br from-orange-500 to-amber-500
                  text-white shadow-sm shadow-orange-200
                  hover:shadow-md hover:shadow-orange-300 hover:scale-[1.02]
                  active:scale-100
                  transition-all duration-200
                "
              >
                <User size={15} strokeWidth={2.2} />
                My Account
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle menu"
                className="md:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Animated Search Panel ── */}
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${searchOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"}
            border-t border-gray-100
          `}
        >
          <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-4 text-gray-400 pointer-events-none"
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenders by keyword, ministry, category…"
                className="
                  w-full pl-12 pr-36 py-3 rounded-xl
                  border border-gray-200
                  bg-gray-50 focus:bg-white
                  text-sm text-gray-800 placeholder-gray-400
                  outline-none ring-0
                  focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                  transition-all duration-200
                "
              />
              <button
                type="submit"
                className="
                  absolute right-2
                  flex items-center gap-1.5
                  px-4 py-2 rounded-lg text-sm font-semibold
                  bg-linear-to-r from-orange-500 to-amber-500
                  text-white
                  hover:from-orange-600 hover:to-amber-600
                  transition-all duration-200
                  cursor-pointer
                "
              >
                Search
                <ChevronRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Mobile Dropdown Menu ── */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}
            border-t border-gray-100 bg-white/95 backdrop-blur-md
          `}
        >
          <nav className="max-w-350 mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                    }
                  `}
                >
                  {link.label}
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              );
            })}

            {/* Mobile account link */}
            <Link
              href="/account"
              className="
                flex items-center gap-2 mt-2
                px-4 py-3 rounded-xl text-sm font-semibold
                bg-linear-to-r from-orange-500 to-amber-500
                text-white justify-center
              "
            >
              <User size={15} />
              My Account
            </Link>
          </nav>
        </div>

      </header>

      {/* ── Spacer so page content doesn't hide under fixed header ── */}
      <div className="h-17" />
    </>
  );
}
