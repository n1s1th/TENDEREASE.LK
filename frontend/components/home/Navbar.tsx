"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X, Menu, MapPin, SlidersHorizontal, ArrowRight, Clock, TrendingUp, Shield, Building2, ChevronDown, User as UserIcon, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { login, logout, signup } from "@/lib/keycloak";
import { useAuthStore } from "@/store";
import { useAuth } from "@/providers/AuthProvider";
import { getVendorByEmail } from "@/lib/api/vendorApi";
import { getOfficerByEmail } from "@/lib/api/officerApi";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tenders", href: "/tenders" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Help / FAQ", href: "/qa" },
];

const trendingSearches = [
  "Road Construction",
  "IT Infrastructure",
  "Medical Equipment",
  "Building Renovation",
  "Water Supply",
];

const categories = [
  "All Categories",
  "Construction",
  "IT & Technology",
  "Healthcare",
  "Education",
  "Transportation",
  "Energy",
  "Agriculture",
  "Water & Sanitation",
];

export default function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchFocused, setSearchFocused] = useState(false);
  const [registerDropdownOpen, setRegisterDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isAuthenticated, user, officerRegistrationStatus } = useAuthStore();
  const { initialized, error } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const registerDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [hasDbVendorProfile, setHasDbVendorProfile] = useState(false);
  const [hasDbOfficerProfile, setHasDbOfficerProfile] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setHasDbVendorProfile(false);
      setHasDbOfficerProfile(false);
      return;
    }

    const checkDbProfiles = async () => {
      try {
        const vendor = await getVendorByEmail(user.email!);
        if (vendor) {
          setHasDbVendorProfile(true);
        }
      } catch (err) {
        // Not a vendor
      }

      try {
        const officer = await getOfficerByEmail(user.email!);
        if (officer) {
          setHasDbOfficerProfile(true);
        }
      } catch (err) {
        // Not an officer
      }
    };

    checkDbProfiles();
  }, [isAuthenticated, user]);

  // Check if user needs to register as officer or vendor
  const hasOfficerRole = (user?.roles?.includes('PROCUREMENT_OFFICER') ?? false) || hasDbOfficerProfile;
  const hasVendorRole = (user?.roles?.includes('VENDOR') ?? false) || hasDbVendorProfile;
  const hasAdminRole = user?.roles?.includes('ADMIN') ?? false;
  const hasCaoRole = user?.roles?.includes('CAO') ?? false;
  const hasPendingRegistration = officerRegistrationStatus === 'PENDING';
  const needsRoleRegistration = isAuthenticated && !hasOfficerRole && !hasVendorRole && !hasAdminRole && !hasCaoRole && !hasPendingRegistration;

  // Determine dashboard path based on role
  const getDashboardPath = (): string | null => {
    if (hasAdminRole) return '/admin';
    if (hasCaoRole) return '/cao-dashboard';
    if (hasOfficerRole) return '/officer-dashboard';
    if (hasVendorRole) return '/dashboard';
    if (hasPendingRegistration) return '/registration-pending';
    return '/dashboard';
  };
  const dashboardPath = getDashboardPath();

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (registerDropdownRef.current && !registerDropdownRef.current.contains(e.target as Node)) {
        setRegisterDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return !prev;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim() || selectedCategory !== "All Categories") {
      window.location.href = `/tenders?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(selectedCategory)}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchFocused(false);
    }
  };

  return (
    <header className="te-navbar">
      {/* Main navbar container */}
      <div className="te-navbar__container">
        {/* Logo & Brand */}
        <Link href="/" className="te-navbar__brand">
          <div className="te-navbar__logo-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt="TenderEase.lk"
              width={44}
              height={44}
            />
          </div>
          <div className="te-navbar__brand-text">
            <span className="te-navbar__brand-name">TenderEase.lk</span>
            <span className="te-navbar__brand-tagline">Sri Lanka Government Tendering &amp; Bidding Platform</span>
          </div>
        </Link>

        {/* Desktop Nav links */}
        <nav className="te-navbar__nav">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`te-navbar__link ${pathname === link.href ? "te-navbar__link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="te-navbar__actions">
          {/* Authentication Buttons */}
          {!initialized ? (
            <div className="te-navbar__auth-loading">
              <div className="te-navbar__auth-dot" />
              <div className="te-navbar__auth-dot" />
              <div className="te-navbar__auth-dot" />
            </div>
          ) : error ? (
            <div className="te-navbar__auth-error" title={error}>
              Auth Error
            </div>
          ) : !isAuthenticated ? (
            <>
              <button onClick={login} className="te-navbar__btn te-navbar__btn--signin">
                Sign In
              </button>
              <button onClick={signup} className="te-navbar__btn te-navbar__btn--signup">
                Sign Up
              </button>
            </>
          ) : (
            <div className="te-navbar__user" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {needsRoleRegistration ? (
                <>
                  <div className="te-navbar__register-dropdown" ref={registerDropdownRef}>
                    <div className="te-navbar__register-trigger">
                      <Link href="/vendor-registration" className="te-navbar__btn te-navbar__btn--register-vendor">
                        <Building2 size={14} />
                        <span>Register as Vendor</span>
                      </Link>
                      <button
                        className="te-navbar__register-arrow"
                        onClick={() => setRegisterDropdownOpen((prev) => !prev)}
                        aria-label="More registration options"
                      >
                        <ChevronDown size={14} className={registerDropdownOpen ? "te-navbar__arrow-rotated" : ""} />
                      </button>
                    </div>
                    {registerDropdownOpen && (
                      <div className="te-navbar__register-menu">
                        <Link
                          href="/officer-registration"
                          className="te-navbar__register-menu-item"
                          onClick={() => setRegisterDropdownOpen(false)}
                        >
                          <Shield size={14} />
                          <span>Register as Officer</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  <button onClick={logout} className="te-navbar__btn te-navbar__btn--signout">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {dashboardPath && (
                    <Link
                      href={dashboardPath}
                      className="te-navbar__btn te-navbar__btn--signin"
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    >
                      <UserIcon size={14} />
                      <span>My Profile</span>
                    </Link>
                  )}
                  <div className="te-navbar__profile-container" ref={profileDropdownRef}>
                    <button
                      className="te-navbar__user-avatar"
                      onClick={() => setProfileDropdownOpen((prev) => !prev)}
                      aria-label="Profile menu"
                    >
                      <UserIcon size={18} />
                    </button>
                    {profileDropdownOpen && (
                      <div className="te-navbar__profile-menu">
                        <button onClick={logout} className="te-navbar__profile-menu-item te-navbar__profile-menu-item--signout">
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="te-navbar__hamburger"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <Menu size={22} />
          </button>
        </div>
      </div>


      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="te-navbar__mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`te-navbar__mobile-link ${pathname === link.href ? "te-navbar__mobile-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated ? (
            <>
              <button onClick={login} className="te-navbar__mobile-signin">
                Sign In
              </button>
              <button onClick={signup} className="te-navbar__mobile-link">
                Sign Up
              </button>
            </>
          ) : (
            <>
              {needsRoleRegistration ? (
                <div className="te-navbar__mobile-register-group">
                  <Link
                    href="/vendor-registration"
                    onClick={() => setMobileMenuOpen(false)}
                    className="te-navbar__mobile-register te-navbar__mobile-register--vendor"
                  >
                    <Building2 size={16} />
                    <span>Register as Vendor</span>
                  </Link>
                  <Link
                    href="/officer-registration"
                    onClick={() => setMobileMenuOpen(false)}
                    className="te-navbar__mobile-register te-navbar__mobile-register--officer"
                  >
                    <Shield size={16} />
                    <span>Register as Officer</span>
                  </Link>
                </div>
              ) : (
                dashboardPath && (
                  <Link
                    href={dashboardPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="te-navbar__mobile-link"
                    style={{ fontWeight: 600, color: "#953002" }}
                  >
                    My Profile
                  </Link>
                )
              )}
              <button onClick={logout} className="te-navbar__mobile-signin te-navbar__mobile-signin--out">
                Sign Out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
