"use client";

import React, { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getVendors, getVendorById } from "@/services/vendor.service";
import {
  Search,
  Building2,
  Shield,
  FileText,
  Download,
  Check,
  X,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  ExternalLink,
  Layers,
  Globe,
  MapPin,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCheck,
  HelpCircle,
  FileCode2,
  Calendar,
  Building,
  RotateCcw
} from "lucide-react";

// TypeScript Interfaces matching backend VendorProfileResponse
interface OfficerDetail {
  nicOrPassportNo: string;
  name: string;
  designation: string;
  mobilePhone: string;
  email: string;
}

interface VendorDocument {
  docId: string;
  documentType: string;
  documentTitle: string | null;
  originalFileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

interface VendorProfile {
  vendorId: string;
  status: string;
  businessName: string;
  registrationAuthority: string;
  registrationNumber: string;
  organizationType: string;
  country: string;
  registrationAddress: string;
  city: string;
  province: string;
  website: string | null;
  officialEmail: string;
  officialTelephone: string;
  cidaGrade: string | null;
  drcVerified: boolean;
  drcCompanyName: string | null;
  drcIncorporationDate: string | null;
  authorizedOfficer: OfficerDetail | null;
  documents: VendorDocument[];
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  departments?: string[];
}

const DEPARTMENTS = [
  "Planning Division",
  "Procurement Unit",
  "Infrastructure Development",
  "Supplies Division",
  "Logistics Division",
  "Engineering Branch",
  "Roads Development",
  "Public Transport Division",
  "Irrigation & Water Management",
  "Research & Development",
];

export default function AdminDashboard() {
  // State variables
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCida, setSelectedCida] = useState("ALL");
  const [selectedDrc, setSelectedDrc] = useState("ALL");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  
  // Detail Drawer State
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch Vendors list
  const fetchVendorsList = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all to support rich client-side search/filtering or call paginated endpoint
      // We pass page, size, and ALL status
      const response = await getVendors(page, size, "ALL");
      if (response && response.content) {
        setVendors(response.content);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || response.content.length);
      } else if (Array.isArray(response)) {
        setVendors(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setVendors([]);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to retrieve vendor registry records. Please verify the user-service is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorsList();
  }, [page]);

  // Fetch single vendor details when selected
  useEffect(() => {
    if (!selectedVendorId) {
      setSelectedVendor(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await getVendorById(selectedVendorId);
        setSelectedVendor(details);
        setDrawerOpen(true);
      } catch (err) {
        console.error("Failed to load vendor details", err);
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedVendorId]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCida("ALL");
    setSelectedDrc("ALL");
    setSelectedDepartment("ALL");
  };

  // Client-Side Search & Filter Application
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // 1. Search Query Match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = vendor.businessName?.toLowerCase().includes(query);
        const brnMatch = vendor.registrationNumber?.toLowerCase().includes(query);
        const emailMatch = vendor.officialEmail?.toLowerCase().includes(query);
        if (!nameMatch && !brnMatch && !emailMatch) return false;
      }

      // 2. CIDA Grade Match
      if (selectedCida !== "ALL") {
        if (!vendor.cidaGrade || vendor.cidaGrade.toUpperCase() !== selectedCida.toUpperCase()) {
          return false;
        }
      }

      // 3. DRC Verification Status Match
      if (selectedDrc !== "ALL") {
        const isVerified = vendor.drcVerified;
        if (selectedDrc === "VERIFIED" && !isVerified) return false;
        if (selectedDrc === "UNVERIFIED" && isVerified) return false;
      }

      // 4. Department Match
      if (selectedDepartment !== "ALL") {
        if (!vendor.departments || !vendor.departments.some(d => d.toLowerCase() === selectedDepartment.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [vendors, searchQuery, selectedCida, selectedDrc, selectedDepartment]);

  // Calculate Metrics from available list
  const metrics = useMemo(() => {
    const total = totalElements || vendors.length;
    const drcVerifiedCount = vendors.filter(v => v.drcVerified).length;
    const drcRate = vendors.length ? Math.round((drcVerifiedCount / vendors.length) * 100) : 100;
    
    // Count CIDA graded vendors
    const cidaCount = vendors.filter(v => v.cidaGrade && v.cidaGrade !== "NONE" && v.cidaGrade !== "").length;
    
    return {
      total,
      drcRate,
      cidaCount
    };
  }, [vendors, totalElements]);

  // Format File Size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-12">
        {/* Top Header Banner */}
        <div className="bg-[#953002] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#953002]/20 text-[#ff7830] rounded-xl border border-[#953002]/30">
                  <Shield size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff7830]">
                  Administrative Console
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mt-2 text-white">
                Vendor Registry Audit Dashboard
              </h1>
              <p className="text-orange-100/80 text-sm mt-1">
                Monitor corporate profiles, verified registers, and uploaded credentials for TenderEase.lk.
              </p>
            </div>

            <button
              onClick={fetchVendorsList}
              className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={16} />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800 shadow-sm animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Service Synchronization Error</h4>
                <p className="text-xs text-red-700/90 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Total Registered Vendors
                </span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : metrics.total}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <TrendingUp size={12} />
                  <span>100% Onboarded & Active</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-[#953002]/10 text-[#953002] rounded-2xl flex items-center justify-center border border-[#953002]/20 group-hover:scale-105 transition-transform duration-300">
                <Building2 size={24} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  DRC Verification Pass Rate
                </span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : `${metrics.drcRate}%`}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Real-time DRC integration</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform duration-300">
                <FileCheck size={24} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Graded Contractors
                </span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? "..." : metrics.cidaCount}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                  <Layers size={12} />
                  <span>CIDA Standard Compliant</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform duration-300">
                <Layers size={24} />
              </div>
            </div>
          </div>

          {/* Table Filters & Controller Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Filter Bar Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-slate-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">
                  Registry Search Filters
                </h2>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-[#953002] transition-colors"
              >
                Clear Search Criteria
              </button>
            </div>

             {/* Filters Input Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Search keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company, BRN, email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                  />
                </div>
              </div>

              {/* CIDA Grade Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  CIDA Grade
                </label>
                <select
                  value={selectedCida}
                  onChange={(e) => setSelectedCida(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                >
                  <option value="ALL">All Grades (Any / None)</option>
                  <option value="C1">C1 Grade</option>
                  <option value="C2">C2 Grade</option>
                  <option value="C3">C3 Grade</option>
                  <option value="C4">C4 Grade</option>
                  <option value="C5">C5 Grade</option>
                  <option value="C6">C6 Grade</option>
                  <option value="C7">C7 Grade</option>
                  <option value="C8">C8 Grade</option>
                  <option value="C9">C9 Grade</option>
                </select>
              </div>

              {/* DRC Integration status */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  DRC Verification Log
                </label>
                <select
                  value={selectedDrc}
                  onChange={(e) => setSelectedDrc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="VERIFIED">DRC Verified Only</option>
                  <option value="UNVERIFIED">Verification Failed / Unverified</option>
                </select>
              </div>

              {/* Procurement Department Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Procurement Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#953002]/20 focus:border-[#953002] transition-all"
                >
                  <option value="ALL">All Departments</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Registry Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Company Name</th>
                    <th className="py-4 px-6">Reg. Number (BRN)</th>
                    <th className="py-4 px-6">CIDA Grade</th>
                    <th className="py-4 px-6">DRC Verification</th>
                    <th className="py-4 px-6">Registered Date</th>
                    <th className="py-4 px-6 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loading ? (
                    // Skeleton Loader Rows
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-6">
                          <div className="h-4 bg-slate-200 rounded-md w-40 mb-1"></div>
                          <div className="h-3 bg-slate-100 rounded-md w-24"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-slate-200 rounded-md w-10"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-6 bg-slate-200 rounded-full w-24"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-slate-200 rounded-md w-20"></div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="h-8 bg-slate-200 rounded-lg w-16 ml-auto"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredVendors.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-100 mb-4">
                          <Building2 size={24} />
                        </div>
                        <h4 className="font-extrabold text-slate-700">No matches found</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          We couldn't find any vendor profiles matching your search filters. Try adjusting your queries.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    // Actual Vendor Rows
                    filteredVendors.map((vendor) => (
                      <tr
                        key={vendor.vendorId}
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => setSelectedVendorId(vendor.vendorId)}
                      >
                        <td className="py-4.5 px-6">
                          <div className="font-black text-slate-900 group-hover:text-[#953002] transition-colors">
                            {vendor.businessName}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {vendor.officialEmail}
                          </div>
                        </td>
                        <td className="py-4.5 px-6 font-mono text-xs font-bold text-slate-600">
                          {vendor.registrationNumber}
                        </td>
                        <td className="py-4.5 px-6">
                          {vendor.cidaGrade ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                              {vendor.cidaGrade}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">None</span>
                          )}
                        </td>
                        <td className="py-4.5 px-6">
                          {vendor.drcVerified ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/40">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              DRC Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/40">
                              <HelpCircle size={12} className="text-slate-500" />
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="py-4.5 px-6 text-xs text-slate-500 font-medium">
                          {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : "N/A"}
                        </td>
                        <td className="py-4.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedVendorId(vendor.vendorId)}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-50 text-slate-600 group-hover:bg-[#953002]/10 group-hover:text-[#953002] rounded-lg text-xs font-bold border border-slate-200/60 group-hover:border-[#953002]/20 transition-all active:scale-95"
                          >
                            <span>Inspect</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredVendors.length} of {totalElements} registered vendors
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-black text-slate-700 px-3">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PREMIUM SLIDE-OUT DETAIL DRAWER */}
        {/* ========================================================================= */}
        {drawerOpen && selectedVendor && (
          <div className="fixed inset-0 z-[9999] overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
              {/* Frosted Glass Backdrop */}
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={() => {
                  setDrawerOpen(false);
                  setSelectedVendorId(null);
                }}
              />

              {/* Drawer Container */}
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="pointer-events-auto w-screen max-w-2xl transform bg-white shadow-2xl transition-all duration-300 ease-in-out border-l border-slate-100 flex flex-col h-full">
                  
                  {/* Drawer Header */}
                  <div className="bg-[#953002] p-6 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedVendor.drcVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 size={10} />
                            DRC Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
                            <HelpCircle size={10} />
                            Unverified
                          </span>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full">
                          {selectedVendor.organizationType}
                        </span>
                      </div>
                      <h2 className="text-xl font-black mt-2 tracking-tight">
                        {selectedVendor.businessName}
                      </h2>
                      <p className="text-orange-100/80 text-xs mt-0.5">
                        BRN: {selectedVendor.registrationNumber}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        setSelectedVendorId(null);
                      }}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 hover:text-white transition-all border border-white/20"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Drawer Body Scroll Container */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
                    
                    {/* Organization Demographics Panel */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Building className="w-4 h-4 text-[#953002]" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                          Corporate Profile Metadata
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                        <div>
                          <div className="text-slate-400 font-bold uppercase tracking-wide">Official Email</div>
                          <a href={`mailto:${selectedVendor.officialEmail}`} className="text-slate-900 font-extrabold flex items-center gap-1 mt-0.5 hover:text-[#953002]">
                            <Mail size={12} className="text-slate-400" />
                            {selectedVendor.officialEmail}
                          </a>
                        </div>

                        <div>
                          <div className="text-slate-400 font-bold uppercase tracking-wide">Telephone Support</div>
                          <div className="text-slate-900 font-extrabold flex items-center gap-1 mt-0.5">
                            <Phone size={12} className="text-slate-400" />
                            {selectedVendor.officialTelephone}
                          </div>
                        </div>

                        <div>
                          <div className="text-slate-400 font-bold uppercase tracking-wide">Corporate Website</div>
                          {selectedVendor.website ? (
                            <a
                              href={selectedVendor.website.startsWith("http") ? selectedVendor.website : `https://${selectedVendor.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#953002] font-extrabold flex items-center gap-1 mt-0.5 hover:underline"
                            >
                              <Globe size={12} className="text-[#ff7830]" />
                              {selectedVendor.website}
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-slate-400 font-bold mt-0.5">Not Provided</span>
                          )}
                        </div>

                        <div>
                          <div className="text-slate-400 font-bold uppercase tracking-wide">CIDA Grading Level</div>
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/50 font-bold">
                            {selectedVendor.cidaGrade || "NONE"}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <div className="text-slate-400 font-bold uppercase tracking-wide">Registered Legal Address</div>
                          <div className="text-slate-900 font-extrabold flex items-start gap-1.5 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <span>
                              {selectedVendor.registrationAddress}, {selectedVendor.city}, {selectedVendor.province}, {selectedVendor.country}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="text-slate-400 font-bold uppercase tracking-wide">Procurement Departments</div>
                          {selectedVendor.departments && selectedVendor.departments.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {selectedVendor.departments.map((dept, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                                  {dept}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 font-extrabold mt-1 text-[11px]">None Selected</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DRC Verification Details Integration */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                          DRC Verification Registers (Real-Time API Logs)
                        </h3>
                      </div>

                      {selectedVendor.drcVerified ? (
                        <div className="space-y-4">
                          <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex gap-3 text-emerald-800 text-xs font-bold leading-normal">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                              Organization credentials successfully validated against the Department of Registrar of Companies (DRC) API registry.
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="text-slate-400 font-bold uppercase tracking-wide">DRC Registered Name</div>
                              <div className="text-slate-900 font-extrabold mt-0.5">{selectedVendor.drcCompanyName}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 font-bold uppercase tracking-wide">Incorporation Date</div>
                              <div className="text-slate-900 font-extrabold mt-0.5 flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {selectedVendor.drcIncorporationDate ? new Date(selectedVendor.drcIncorporationDate).toLocaleDateString() : "N/A"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-slate-600 text-xs font-medium">
                          <HelpCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            No matching company registry logs returned from the Registrar database. This company's name and incorporation date could not be verified automatically.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Authorized Liaison Officer Contact */}
                    {selectedVendor.authorizedOfficer ? (
                      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                          <User className="w-4 h-4 text-[#953002]" />
                          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                            Authorized Liaison Officer
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
                          <div>
                            <div className="text-slate-400 font-bold uppercase tracking-wide">Officer Name</div>
                            <div className="text-slate-900 font-extrabold mt-0.5 flex items-center gap-1">
                              <User size={12} className="text-slate-400" />
                              {selectedVendor.authorizedOfficer.name}
                            </div>
                          </div>

                          <div>
                            <div className="text-slate-400 font-bold uppercase tracking-wide">Designation Role</div>
                            <div className="text-slate-900 font-extrabold mt-0.5">{selectedVendor.authorizedOfficer.designation}</div>
                          </div>

                          <div>
                            <div className="text-slate-400 font-bold uppercase tracking-wide">NIC / Passport Number</div>
                            <div className="text-slate-900 font-mono font-bold mt-0.5">{selectedVendor.authorizedOfficer.nicOrPassportNo}</div>
                          </div>

                          <div>
                            <div className="text-slate-400 font-bold uppercase tracking-wide">Personal Mobile Phone</div>
                            <div className="text-slate-900 font-extrabold mt-0.5 flex items-center gap-1">
                              <Phone size={12} className="text-slate-400" />
                              {selectedVendor.authorizedOfficer.mobilePhone}
                            </div>
                          </div>

                          <div className="col-span-2">
                            <div className="text-slate-400 font-bold uppercase tracking-wide">Liaison Officer Email</div>
                            <a href={`mailto:${selectedVendor.authorizedOfficer.email}`} className="text-slate-900 font-extrabold flex items-center gap-1 mt-0.5 hover:text-[#953002]">
                              <Mail size={12} className="text-slate-400" />
                              {selectedVendor.authorizedOfficer.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-slate-600 text-xs font-medium">
                        <AlertCircle size={18} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>Authorized officer details are missing for this profile record.</div>
                      </div>
                    )}

                    {/* Uploaded Documents Credentials Audit list */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#953002]" />
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                          Uploaded Credentials Audit ({selectedVendor.documents.length})
                        </h3>
                      </div>

                      {selectedVendor.documents.length === 0 ? (
                        <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200 text-slate-400">
                          No downloadable legal documents found for this profile.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {selectedVendor.documents.map((doc) => (
                            <div
                              key={doc.docId}
                              className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 group-hover:bg-[#953002]/10 group-hover:text-[#953002] transition-colors">
                                  <FileCode2 size={20} />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-xs font-black text-slate-800">
                                    {doc.documentTitle || doc.documentType}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    <span>{doc.documentType}</span>
                                    <span>•</span>
                                    <span>{formatBytes(doc.fileSizeBytes)}</span>
                                  </div>
                                </div>
                              </div>

                              <a
                                href={process.env.NEXT_PUBLIC_USER_API_URL 
                                  ? `${process.env.NEXT_PUBLIC_USER_API_URL}/v1/vendors/${selectedVendor.vendorId}/documents/${doc.docId}` 
                                  : `http://localhost:8081/api/v1/vendors/${selectedVendor.vendorId}/documents/${doc.docId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#953002] hover:text-white hover:border-[#953002] transition-all active:scale-95 shadow-sm"
                              >
                                <Download size={13} />
                                <span>Download</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drawer Footer controls */}
                  <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
                    <button
                      onClick={() => {
                        setDrawerOpen(false);
                        setSelectedVendorId(null);
                      }}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-slate-950/10"
                    >
                      Close Audit Log
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
