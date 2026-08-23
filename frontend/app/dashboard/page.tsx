"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { useAuth } from "@/providers/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getVendorByEmail } from "@/lib/api/vendorApi";
import { getOfficerByEmail } from "@/lib/api/officerApi";
import {
  Building2,
  User,
  Mail,
  FileText,
  Phone,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  MapPin,
  Activity,
  Award,
  Loader2,
  Lock,
  Tag
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  let bg = "bg-gray-100 text-gray-800 border-gray-200";
  let dot = "bg-gray-400";
  const normalizedStatus = status.toUpperCase();

  if (["APPROVED", "ACCEPTED", "VERIFIED", "ACTIVE"].includes(normalizedStatus)) {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    dot = "bg-emerald-500";
  } else if (["PENDING", "SUBMITTED"].includes(normalizedStatus)) {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    dot = "bg-amber-500";
  } else if (["REJECTED", "DECLINED", "FAILED"].includes(normalizedStatus)) {
    bg = "bg-rose-50 text-rose-700 border-rose-200";
    dot = "bg-rose-500";
  } else if (["OPENED", "EVALUATING"].includes(normalizedStatus)) {
    bg = "bg-sky-50 text-sky-700 border-sky-200";
    dot = "bg-sky-500";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
}

export default function MemberDashboard() {
  const { isAuthenticated, user, officerRegistrationStatus } = useAuthStore();
  const { initialized } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  
  // Profile Data States
  const [vendorData, setVendorData] = useState<any>(null);
  const [officerData, setOfficerData] = useState<any>(null);
  const [bidsList, setBidsList] = useState<any[]>([]);
  const [tendersMap, setTendersMap] = useState<Record<string, any>>({});

  // Roles check
  const isVendor = user?.roles?.includes("VENDOR") ?? false;
  const isOfficer = user?.roles?.includes("PROCUREMENT_OFFICER") ?? false;
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const isCao = user?.roles?.includes("CAO") ?? false;

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push("/");
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;

    async function loadDashboardData() {
      setLoading(true);
      try {
        // 1. Try to fetch Vendor Profile by user's email
        let vendorProfile = null;
        try {
          vendorProfile = await getVendorByEmail(user.email!);
          setVendorData(vendorProfile);
        } catch (err) {
          console.log("No vendor profile found for email:", user.email);
        }

        if (vendorProfile) {
          const token = useAuthStore.getState().token;
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

          // 2. Fetch Bids submitted by this vendor
          const bidServiceUrl = process.env.NEXT_PUBLIC_BID_SERVICE_URL || "http://localhost:8083/api/bids";
          const bidsRes = await axios.get(`${bidServiceUrl}?bidderEmail=${encodeURIComponent(user.email!)}`, config);
          
          if (bidsRes.data && bidsRes.data.success) {
            const bids = bidsRes.data.data || [];
            setBidsList(bids);

            // Fetch Tender details for each unique tenderId to resolve their Titles
            const tenderServiceUrl = `${process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || "http://localhost:8082"}/api/tenders`;
            const uniqueTenderIds = Array.from(new Set(bids.map((b: any) => b.tenderId))) as string[];
            
            const tenderPromises = uniqueTenderIds.map(async (tid) => {
              try {
                const res = await axios.get(`${tenderServiceUrl}/${tid}`, config);
                return { id: tid, data: res.data };
              } catch (err) {
                console.error(`Failed to fetch tender details for ${tid}:`, err);
                return { id: tid, data: null };
              }
            });

            const resolvedTenders = await Promise.all(tenderPromises);
            const tMap: Record<string, any> = {};
            resolvedTenders.forEach((t) => {
              if (t.data) {
                tMap[t.id] = t.data;
              }
            });
            setTendersMap(tMap);
          }
        } else if (isOfficer && !isCao) {
          // Fetch Officer details
          const profile = await getOfficerByEmail(user.email!);
          setOfficerData(profile);
        }
      } catch (err) {
        console.error("Error loading member dashboard details:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAuthenticated, user, isVendor, isOfficer, isCao]);

  if (!initialized || loading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex flex-col items-center justify-center font-inter">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#953002] animate-spin" />
          <span className="text-[12px] font-black tracking-widest text-[#953002] uppercase animate-pulse">
            Loading Profile Dashboard...
          </span>
        </div>
      </div>
    );
  }

  // Determine user display role/tag
  let displayRole = "General Member";
  if (isAdmin) displayRole = "Administrator";
  else if (isCao) displayRole = "Chief Administrative Officer";
  else if (isOfficer) displayRole = "Procurement Officer";
  else if (vendorData) displayRole = "Registered Vendor";

  return (
    <ProtectedRoute>
    <div className="bg-[#FAF9F6] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all hover:shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#953002]/10 flex items-center justify-center text-[#953002]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-gray-900">
                  Welcome, {user?.name || user?.username}!
                </h1>
                <p className="text-xs text-gray-500 font-medium">Logged in via Keycloak Integration</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-gray-400" />
                Username: {user?.username}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Account Role</span>
            <span className="px-3.5 py-1.5 rounded-xl bg-[#953002] text-white text-xs font-black shadow-sm tracking-wide">
              {displayRole}
            </span>
          </div>
        </div>

        {/* ── CASE A: VENDOR DASHBOARD ── */}
        {vendorData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left & Mid Columns: Corporate Credentials */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Company profile Details */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                  <div className="border-b pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#953002]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-900">Company Profile Details</h2>
                        <p className="text-xs text-gray-500">Corporate registration record and classifications</p>
                      </div>
                    </div>
                    <StatusBadge status={vendorData.status} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Name</span>
                      <p className="font-extrabold text-gray-800 text-base">{vendorData.businessName}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration Type</span>
                      <p className="font-extrabold text-gray-800">{vendorData.organizationType}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registration No (BRN)</span>
                      <p className="font-mono font-bold text-[#953002] bg-orange-50/50 px-2 py-0.5 rounded border border-orange-100 inline-block">
                        {vendorData.registrationNumber}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">VAT Registration No</span>
                      <p className="font-mono font-semibold text-gray-700">
                        {vendorData.vatRegistrationNumber || "N/A (Not Registered)"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CIDA Grade</span>
                      <p className="font-extrabold text-gray-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        {vendorData.cidaGrade || "N/A (Non-construction)"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Email</span>
                      <p className="font-semibold text-gray-700">{vendorData.officialEmail}</p>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Address</span>
                      <p className="text-gray-700 font-medium flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>
                          {vendorData.registrationAddress}, {vendorData.city},{" "}
                          {vendorData.province && `${vendorData.province}, `}{vendorData.postalCode},{" "}
                          {vendorData.country}
                        </span>
                      </p>
                    </div>

                    {vendorData.departments && vendorData.departments.length > 0 && (
                      <div className="col-span-1 md:col-span-2 space-y-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Departments</span>
                        <div className="flex flex-wrap gap-1.5">
                          {vendorData.departments.map((dept: any) => (
                            <span
                              key={dept.id || dept.name}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-150 text-xs font-bold text-gray-600"
                            >
                              <Tag className="w-3 h-3 text-gray-400" />
                              {dept.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Authorized Officer */}
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#953002]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-900">Authorized Officer</h2>
                        <p className="text-xs text-gray-500">Corporate liaison contact profile</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#953002] border font-black">
                        {vendorData.authorizedOfficer?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900">{vendorData.authorizedOfficer?.name}</h4>
                        <p className="text-xs font-medium text-gray-500">{vendorData.authorizedOfficer?.designation}</p>
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">NIC / Passport</span>
                        <span className="font-mono font-bold text-gray-800">{vendorData.authorizedOfficer?.nicOrPassportNo}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Phone</span>
                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {vendorData.authorizedOfficer?.mobilePhone}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Officer Email</span>
                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {vendorData.authorizedOfficer?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bids and Tenders Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#953002]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">Your Bid Submissions</h2>
                    <p className="text-xs text-gray-500">Track and monitor your bidded government tenders</p>
                  </div>
                </div>
              </div>

              {bidsList.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-gray-50/50 border border-dashed rounded-xl">
                  <Clock className="w-10 h-10 text-gray-300" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">No Bid Submissions Yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mt-0.5">
                      You haven't bidded on any tenders. Explore active government opportunities and submit a bid!
                    </p>
                  </div>
                  <Link href="/tenders" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#953002] text-white text-xs font-extrabold hover:bg-[#802a02] transition-colors shadow-sm">
                    Browse Active Tenders
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-600 font-bold">
                        <th className="py-3 px-4 text-xs uppercase tracking-wider">Tender Ref / Title</th>
                        <th className="py-3 px-4 text-xs uppercase tracking-wider">Bid Amount</th>
                        <th className="py-3 px-4 text-xs uppercase tracking-wider">Submitted On</th>
                        <th className="py-3 px-4 text-xs uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-xs uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                      {bidsList.map((bid: any) => {
                        const tenderInfo = tendersMap[bid.tenderId];
                        return (
                          <tr key={bid.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                              {tenderInfo ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-gray-900 line-clamp-1">{tenderInfo.title}</p>
                                  <p className="text-xs font-semibold text-[#953002]">
                                    {tenderInfo.tenderNumber || tenderInfo.referenceNumber}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-gray-900">Government Tender Request</p>
                                  <p className="text-xs font-mono text-gray-400">{bid.tenderId}</p>
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-gray-900">
                                {bid.currency || "LKR"} {Number(bid.bidAmount).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-gray-500 font-semibold">
                              {bid.submittedAt || "N/A"}
                            </td>
                            <td className="py-3.5 px-4">
                              <StatusBadge status={bid.status} />
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/tenders/${bid.tenderId}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#953002] hover:text-[#802a02] transition-colors"
                              >
                                View Tender
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CASE B: PROCUREMENT OFFICER DASHBOARD CARD ── */}
        {isOfficer && !isCao && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
            <div className="border-b pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#953002]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-900">Officer Profile Summary</h2>
                  <p className="text-xs text-gray-500">Official procuring entity details & scope</p>
                </div>
              </div>
              <StatusBadge status="ACTIVE" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Official Username</span>
                  <p className="font-extrabold text-gray-800 text-base">{user?.username}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                  <p className="font-semibold text-gray-700">{user?.email}</p>
                </div>

                {officerData?.procuringEntityType && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Procuring Entity Type</span>
                    <p className="font-extrabold text-gray-800">{officerData.procuringEntityType}</p>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {officerData?.procuringEntityLevel && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Procuring Entity Level</span>
                    <p className="font-extrabold text-gray-800">{officerData.procuringEntityLevel}</p>
                  </div>
                )}

                {officerData?.provincialCouncil && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Provincial Council</span>
                    <p className="font-bold text-gray-800">{officerData.provincialCouncil}</p>
                  </div>
                )}

                {officerData?.organizationName && (
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Department / Org</span>
                    <p className="font-bold text-[#953002] bg-orange-50/50 border border-orange-100 px-3 py-1 rounded-xl inline-block">
                      {officerData.organizationName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t flex justify-end">
              <Link
                href="/officer-dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#953002] text-white text-xs font-extrabold shadow hover:bg-[#802a02] transition-colors"
              >
                Go to Officer Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ── CASE C: GENERAL / UNREGISTERED MEMBER VIEW ── */}
        {!vendorData && !isOfficer && !isAdmin && !isCao && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-150 p-6 md:p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-[#953002] mx-auto border">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Finish Setting Up Your Profile</h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  You are registered as a generic user. To participate in government bids or publish tenders, please register as a Vendor or an Officer.
                </p>
              </div>

              {officerRegistrationStatus === "PENDING" && (
                <div className="p-4 bg-amber-50 border border-amber-250 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  Your Officer Registration request is currently pending administrative review.
                </div>
              )}
            </div>

            {officerRegistrationStatus !== "PENDING" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Register as Vendor Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50/50 flex items-center justify-center text-[#953002] border border-orange-100 group-hover:bg-[#953002] group-hover:text-white transition-all">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 text-lg">Register as Vendor</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Register your business/corporate credentials to browse published government tenders, place secure bids, upload compliance sheets, and secure contracts.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/vendor-registration"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Start Business Registration
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Register as Officer Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50/50 flex items-center justify-center text-[#953002] border border-orange-100 group-hover:bg-[#953002] group-hover:text-white transition-all">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-gray-900 text-lg">Register as Procurement Officer</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Onboard your ministry or department. Authorize tenders, perform technical and financial evaluations on submissions, and oversee the bid opening log.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/officer-registration"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Start Officer Registration
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
    </ProtectedRoute>
  );
}
