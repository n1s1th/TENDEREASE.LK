"use client";

import { useState } from "react";
import { Search, X, Menu } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Tenders", href: "/tenders" },
  { label: "How it Works", href: "/how-it-works" },
  { label: "Help / FAQ", href: "/help" },
];

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  return (
    <header className="navbar-header">
      {/* Main navbar container */}
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          TenderHub
        </Link>

        {/* Desktop Nav links */}
        <nav className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setActiveLink(link.label)}
              className={`navbar-link ${activeLink === link.label ? "navbar-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="navbar-actions">
          {/* Search toggle */}
          <button
            className="navbar-search-btn"
            aria-label="Toggle search"
            onClick={() => setSearchOpen((prev) => !prev)}
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Sign In button */}
          <Link href="/sign-in" className="navbar-signin-btn">
            Sign In
          </Link>

          {/* Mobile hamburger */}
          <button
            className="navbar-hamburger"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="navbar-search-bar">
          <div className="navbar-search-inner">
            <Search size={16} className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search tenders, categories…"
              className="navbar-search-input"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="navbar-mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                setActiveLink(link.label);
                setMobileMenuOpen(false);
              }}
              className={`navbar-mobile-link ${activeLink === link.label ? "navbar-mobile-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/sign-in" className="navbar-mobile-signin">
            Sign In
          </Link>
        </nav>
      )}
    </header>
  );
}
