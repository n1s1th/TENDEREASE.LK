"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Upload, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import TenderLayout from "@/components/tender/TenderLayout";
import { getTenderById } from "@/services/tender.service";
import { submitBid, uploadBidDocument } from "@/services/bid.service";
import { useAuthStore } from "@/store";

interface BoqItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  total: number;
}

interface SpecItem {
  criterion: string;
  compliance: "Compliant" | "Non-Compliant";
  deviation: string;
}

export default function BidSubmissionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [step, setStep] = useState(1);
  const steps = ["Form of Bid", "Priced e-BOQ", "Technical Compliance", "Supporting Documents", "Review & Submit"];

  // Form inputs state
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");
  
  // Bid Security
  const [bidSecurityIssuer, setBidSecurityIssuer] = useState("");
  const [bidSecurityExpiry, setBidSecurityExpiry] = useState("");
  const [bidSecurityValue, setBidSecurityValue] = useState("");
  const [bidSecurityFile, setBidSecurityFile] = useState("");
  
  // BOQ Items
  const [boqItems, setBoqItems] = useState<BoqItem[]>([
    { id: "1", description: "General Mobilization & Demobilization", unit: "Sum", quantity: 1, rate: 0, total: 0 },
    { id: "2", description: "Excavation and Earthwork", unit: "m3", quantity: 10, rate: 0, total: 0 }
  ]);

  // Technical Vetting files & data
  const [pca3File, setPca3File] = useState("");
  const [cidaFile, setCidaFile] = useState("");
  const [cidaHistoryBookFile, setCidaHistoryBookFile] = useState("");
  const [equipmentList, setEquipmentList] = useState({
    concreteMixer: false,
    dumpTruck: false,
    excavator: false,
    weldingMachine: false
  });

  // MAF File for Goods/Services
  const [mafFile, setMafFile] = useState("");

  // Technical Specifications Matrix
  const [techComplianceMatrix, setTechComplianceMatrix] = useState<SpecItem[]>([
    { criterion: "Meets minimal performance standards", compliance: "Compliant", deviation: "" },
    { criterion: "Delivery time within specified window", compliance: "Compliant", deviation: "" },
    { criterion: "Warranty and after-sales service standard", compliance: "Compliant", deviation: "" }
  ]);

  // Supporting files
  const [cvsFile, setCvsFile] = useState("");
  const [methodologyFile, setMethodologyFile] = useState("");
  const [pastExperienceFile, setPastExperienceFile] = useState("");
  const [ganttChartFile, setGanttChartFile] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setError("Please log in to submit a bid.");
      setLoading(false);
      return;
    }

    getTenderById(id)
      .then((data) => {
        setTender(data);
        // Prepopulate specs from tender if any
        if (data.dynamicData && data.dynamicData.techSpecifications) {
          const specs = (data.dynamicData.techSpecifications as string[]).map(c => ({
            criterion: c,
            compliance: "Compliant" as const,
            deviation: ""
          }));
          if (specs.length > 0) {
            setTechComplianceMatrix(specs);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to retrieve tender requirements.");
        setLoading(false);
      });
  }, [id, isAuthenticated]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    try {
      const res = await uploadBidDocument(file);
      if (res.success && res.filePath) {
        setter(res.filePath);
      } else {
        setError("File upload failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "File upload encountered an error.");
    }
  };

  // BOQ helper
  const addBoqItem = () => {
    setBoqItems([
      ...boqItems,
      { id: Date.now().toString(), description: "", unit: "Nos", quantity: 1, rate: 0, total: 0 }
    ]);
  };

  const removeBoqItem = (boqId: string) => {
    setBoqItems(boqItems.filter(item => item.id !== boqId));
  };

  const updateBoqItem = (boqId: string, field: keyof BoqItem, value: any) => {
    setBoqItems(boqItems.map(item => {
      if (item.id === boqId) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.total = (updated.quantity || 0) * (updated.rate || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const boqTotalSum = boqItems.reduce((acc, item) => acc + item.total, 0);

  // Vetting Step Validation
  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!companyName.trim()) {
        setError("Company Name is required.");
        return false;
      }
      if (!bidSecurityIssuer.trim() || !bidSecurityExpiry || !bidSecurityValue || !bidSecurityFile) {
        setError("All Bid Security metadata fields and the certificate upload are required.");
        return false;
      }
    }
    if (step === 2) {
      if (boqTotalSum <= 0) {
        setError("You must define at least one item in the BOQ with a rate greater than zero.");
        return false;
      }
      for (const item of boqItems) {
        if (!item.description.trim()) {
          setError("Item descriptions must not be empty.");
          return false;
        }
      }
    }
    if (step === 3) {
      // PCA 3 requirement
      const budget = tender?.estimatedBudget || 0;
      if (budget >= 5000000 && !pca3File) {
        setError("Under the Public Contracts Act, a PCA 3 Certificate upload is mandatory for projects valued at LKR 5,000,000 or above.");
        return false;
      }
      // Works specific CIDA requirements
      if (tender?.procurementType === "WORKS") {
        if (!cidaFile || !cidaHistoryBookFile) {
          setError("CIDA Registration Certificate and History Record Book uploads are mandatory for Works (Construction) tenders.");
          return false;
        }
      }
      // Goods/Services MAF
      if ((tender?.procurementType === "GOODS" || tender?.procurementType === "SERVICES") && tender?.dynamicData?.mafRequired) {
        if (!mafFile) {
          setError("Manufacturer Authorization Form (MAF) is mandatory for this procurement.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setError("");
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    const bidData = {
      pca3File,
      cidaFile,
      cidaHistoryBookFile,
      equipmentList,
      mafFile,
      techComplianceMatrix,
      boqItems,
      bidSecurity: {
        issuer: bidSecurityIssuer,
        expiryDate: bidSecurityExpiry,
        value: bidSecurityValue,
        fileUrl: bidSecurityFile
      },
      cvsFile,
      methodologyFile,
      pastExperienceFile,
      ganttChartFile
    };

    const payload = {
      tenderId: id,
      bidderEmail: user?.email,
      bidderName: user?.name || "Anonymous Vendor",
      companyName,
      bidAmount: boqTotalSum,
      currency: "LKR",
      notes,
      bidData
    };

    try {
      const res = await submitBid(payload);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Bid submission failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while submitting your bid. Ensure CIDA grade compatibility and compliance criteria are fully met.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TenderLayout>
        <div className="py-20 text-center text-gray-2 font-medium">Loading submission wizard...</div>
      </TenderLayout>
    );
  }

  if (success) {
    return (
      <TenderLayout>
        <div className="max-w-xl mx-auto py-20 px-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-premium text-center space-y-6">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-black-1">Bid Submitted Successfully!</h1>
          <p className="text-gray-2 text-base leading-relaxed">
            Your bid for <strong>{tender?.title}</strong> has been secured and sent for opening and evaluation.
          </p>
          <div className="pt-6">
            <Link href="/tenders">
              <button className="bg-primary text-white font-bold py-4 px-10 rounded-2xl hover:shadow-primary transition-all active:scale-95">
                Return to Directory
              </button>
            </Link>
          </div>
        </div>
      </TenderLayout>
    );
  }

  return (
    <TenderLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header summary */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-md">
              TENDER SUBMISSION WIZARD
            </span>
            <h1 className="text-2xl font-black text-black-1 mt-2">{tender?.title}</h1>
            <p className="text-xs text-gray-3 font-semibold mt-1">ID: {tender?.tenderNumber || "TBA"} | Budget: LKR {Number(tender?.estimatedBudget || 0).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-gray-3 uppercase tracking-wider block">QUOTED PRICE</span>
            <span className="text-3xl font-black text-[#a03d11]">LKR {boqTotalSum.toLocaleString()}</span>
          </div>
        </div>

        {/* Stepper bar */}
        <div className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-x-auto no-scrollbar">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3 whitespace-nowrap">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step > idx + 1 ? "bg-success text-white" : step === idx + 1 ? "bg-primary text-white" : "bg-gray-5 text-gray-3 border border-gray-200"
              }`}>
                {step > idx + 1 ? <Check size={14} /> : idx + 1}
              </div>
              <span className={`text-xs font-black uppercase tracking-wider ${
                step === idx + 1 ? "text-primary" : "text-gray-3"
              }`}>{s}</span>
              {idx < steps.length - 1 && <div className="w-8 h-[2px] bg-gray-100 hidden sm:block"></div>}
            </div>
          ))}
        </div>

        {/* Form panel */}
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 shadow-premium relative">
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: FORM OF BID */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-black-1 pb-4 border-b border-gray-100">1. Form of Bid Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Bidder Official Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ""}
                    className="w-full bg-gray-5 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-2 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Official Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ""}
                    className="w-full bg-gray-5 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-gray-2 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Company / Organization Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter official registered business name"
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Quoted Amount (LKR)</label>
                  <input
                    type="text"
                    disabled
                    value={`LKR ${boqTotalSum.toLocaleString()}`}
                    className="w-full bg-gray-5 border border-gray-200 rounded-xl py-3 px-4 text-sm font-black text-[#a03d11] cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-black text-gray-3 uppercase tracking-widest">Bid Security / Bank Guarantee Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Guarantee Issuing Bank *</label>
                    <input
                      type="text"
                      value={bidSecurityIssuer}
                      onChange={(e) => setBidSecurityIssuer(e.target.value)}
                      placeholder="e.g. Bank of Ceylon"
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Expiry Date *</label>
                    <input
                      type="date"
                      value={bidSecurityExpiry}
                      onChange={(e) => setBidSecurityExpiry(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Guarantee Value (LKR) *</label>
                    <input
                      type="number"
                      value={bidSecurityValue}
                      onChange={(e) => setBidSecurityValue(e.target.value)}
                      placeholder="e.g. 150000"
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-black-2 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Upload Bid Security PDF Certificate *</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-5 py-3 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer transition-colors text-sm font-bold text-gray-3">
                      <Upload size={16} />
                      Choose File
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setBidSecurityFile)} className="hidden" />
                    </label>
                    {bidSecurityFile ? (
                      <span className="text-xs font-bold text-success flex items-center gap-1.5 bg-success/5 px-3 py-1.5 rounded-lg border border-success/10">
                        <FileText size={14} /> Certificate Uploaded
                      </span>
                    ) : (
                      <span className="text-xs text-gray-2">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PRICED E-BOQ */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-black-1">2. Priced Bill of Quantities (e-BOQ)</h2>
                <button
                  onClick={addBoqItem}
                  className="flex items-center gap-2 bg-primary text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl hover:shadow-primary transition-all hover:scale-[1.02]"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-gray-5 border-b border-gray-100">
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-12">#</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider">Item Description</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-24">Unit</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-28">Quantity</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-36">Unit Rate (LKR)</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-36">Total (LKR)</th>
                      <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boqItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-5/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-gray-3">{index + 1}</td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateBoqItem(item.id, "description", e.target.value)}
                            placeholder="Enter item description"
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary p-1 text-sm font-bold text-black-2 focus:outline-none transition-colors"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => updateBoqItem(item.id, "unit", e.target.value)}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary p-1 text-sm font-bold text-black-2 focus:outline-none transition-colors text-center"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateBoqItem(item.id, "quantity", Number(e.target.value))}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary p-1 text-sm font-bold text-black-2 focus:outline-none transition-colors text-right"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateBoqItem(item.id, "rate", Number(e.target.value))}
                            className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary p-1 text-sm font-bold text-black-2 focus:outline-none transition-colors text-right"
                          />
                        </td>
                        <td className="p-4 text-right text-sm font-black text-black-1">
                          LKR {item.total.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => removeBoqItem(item.id)}
                            className="text-error/70 hover:text-error p-1.5 hover:bg-error/5 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pr-16">
                <div className="text-right space-y-1">
                  <span className="text-xs font-black text-gray-3 uppercase tracking-wider block">Total Estimated Price</span>
                  <span className="text-3xl font-black text-[#a03d11]">LKR {boqTotalSum.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TECHNICAL COMPLIANCE */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-black-1 pb-4 border-b border-gray-100">3. Technical Vetting & Compliance</h2>

              {/* Conditional Works / Construction Compliance Form */}
              {tender?.procurementType === "WORKS" && (
                <div className="space-y-6">
                  <div className="p-4 bg-info/5 border border-info/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={20} className="text-info shrink-0" />
                    <div>
                      <span className="text-xs font-black text-info uppercase tracking-wider block">WORKS PROCUREMENT CHECKS</span>
                      <span className="text-xs text-gray-2 font-medium">This tender requires validation of Construction Industry Development Authority (CIDA) credentials. Minimum required grade: <strong>{tender?.dynamicData?.minCidaGrade || "C4"}</strong>.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Upload CIDA Registration Certificate *</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-3 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer transition-colors text-sm font-bold text-gray-3">
                          <Upload size={16} /> Choose File
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setCidaFile)} className="hidden" />
                        </label>
                        {cidaFile ? (
                          <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/5 px-2 py-1 rounded">Uploaded</span>
                        ) : (
                          <span className="text-xs text-gray-2">No file</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Upload CIDA History Record Book *</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-3 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer transition-colors text-sm font-bold text-gray-3">
                          <Upload size={16} /> Choose File
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setCidaHistoryBookFile)} className="hidden" />
                        </label>
                        {cidaHistoryBookFile ? (
                          <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/5 px-2 py-1 rounded">Uploaded</span>
                        ) : (
                          <span className="text-xs text-gray-2">No file</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Equipment & Heavy Machinery Availability Checklist</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.keys(equipmentList).map((key) => (
                        <label key={key} className="flex items-center gap-2.5 p-4 border border-gray-200 rounded-xl hover:border-primary cursor-pointer select-none transition-colors">
                          <input
                            type="checkbox"
                            checked={(equipmentList as any)[key]}
                            onChange={(e) => setEquipmentList({ ...equipmentList, [key]: e.target.checked })}
                            className="rounded border-gray-300 text-primary focus:ring-primary w-4.5 h-4.5"
                          />
                          <span className="text-xs font-bold text-black-2 uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Goods / Services Compliance Form */}
              {(tender?.procurementType === "GOODS" || tender?.procurementType === "SERVICES") && (
                <div className="space-y-6">
                  {tender?.dynamicData?.mafRequired && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Manufacturer Authorization Form (MAF) *</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-3 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer transition-colors text-sm font-bold text-gray-3">
                          <Upload size={16} /> Choose File
                          <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setMafFile)} className="hidden" />
                        </label>
                        {mafFile ? (
                          <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/5 px-2 py-1 rounded">Uploaded</span>
                        ) : (
                          <span className="text-xs text-gray-2">No file</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Technical Specifications Compliance Matrix</label>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-gray-5 border-b border-gray-100">
                            <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider">Required Specifications</th>
                            <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider w-40">Compliance State</th>
                            <th className="p-4 text-xs font-black text-gray-3 uppercase tracking-wider">Deviation Comments / Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {techComplianceMatrix.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-50">
                              <td className="p-4 text-xs font-bold text-black-2">{item.criterion}</td>
                              <td className="p-4">
                                <select
                                  value={item.compliance}
                                  onChange={(e) => {
                                    const updated = [...techComplianceMatrix];
                                    updated[idx].compliance = e.target.value as any;
                                    setTechComplianceMatrix(updated);
                                  }}
                                  className="w-full border border-gray-200 rounded-lg py-2 px-3 text-xs font-semibold text-black-2 focus:border-primary focus:outline-none"
                                >
                                  <option value="Compliant">Compliant</option>
                                  <option value="Non-Compliant">Non-Compliant</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <input
                                  type="text"
                                  value={item.deviation}
                                  onChange={(e) => {
                                    const updated = [...techComplianceMatrix];
                                    updated[idx].deviation = e.target.value;
                                    setTechComplianceMatrix(updated);
                                  }}
                                  placeholder="Specify any variance or confirm specifications"
                                  className="w-full bg-transparent border-0 border-b border-transparent focus:border-primary p-1 text-xs font-semibold text-black-2 focus:outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Contracts Act (LKR >= 5,000,000) check */}
              {Number(tender?.estimatedBudget || 0) >= 5000000 && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={20} className="text-warning shrink-0" />
                    <div>
                      <span className="text-xs font-black text-warning uppercase tracking-wider block">PUBLIC CONTRACTS ACT COMPLIANCE</span>
                      <span className="text-xs text-gray-2 font-medium">As this project's estimated budget is LKR 5,000,000 or above, the bidder is legally required to upload a PCA 3 Registration Certificate.</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider block">Upload PCA 3 Registration Certificate *</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-5 py-3 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 hover:border-primary rounded-xl cursor-pointer transition-colors text-sm font-bold text-gray-3">
                        <Upload size={16} /> Choose File
                        <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setPca3File)} className="hidden" />
                      </label>
                      {pca3File ? (
                        <span className="text-xs font-bold text-success flex items-center gap-1 bg-success/5 px-2 py-1 rounded">Uploaded</span>
                      ) : (
                        <span className="text-xs text-gray-2">No file uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SUPPORTING DOCUMENTS */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-black-1 pb-4 border-b border-gray-100">4. Supporting Vetting Documentation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 p-6 border border-gray-100 rounded-2xl">
                  <label className="text-xs font-black text-black-1 uppercase tracking-wider block">CVs of Key Technical Staff</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl cursor-pointer text-xs font-bold text-gray-3">
                      <Upload size={14} /> Upload PDF
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setCvsFile)} className="hidden" />
                    </label>
                    {cvsFile ? <span className="text-xs text-success font-bold">Uploaded</span> : <span className="text-xs text-gray-2">Not uploaded</span>}
                  </div>
                </div>

                <div className="space-y-3 p-6 border border-gray-100 rounded-2xl">
                  <label className="text-xs font-black text-black-1 uppercase tracking-wider block">Detailed Execution Methodology</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl cursor-pointer text-xs font-bold text-gray-3">
                      <Upload size={14} /> Upload PDF
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setMethodologyFile)} className="hidden" />
                    </label>
                    {methodologyFile ? <span className="text-xs text-success font-bold">Uploaded</span> : <span className="text-xs text-gray-2">Not uploaded</span>}
                  </div>
                </div>

                <div className="space-y-3 p-6 border border-gray-100 rounded-2xl">
                  <label className="text-xs font-black text-black-1 uppercase tracking-wider block">Past Projects & Completion Certificates</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl cursor-pointer text-xs font-bold text-gray-3">
                      <Upload size={14} /> Upload PDF
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setPastExperienceFile)} className="hidden" />
                    </label>
                    {pastExperienceFile ? <span className="text-xs text-success font-bold">Uploaded</span> : <span className="text-xs text-gray-2">Not uploaded</span>}
                  </div>
                </div>

                <div className="space-y-3 p-6 border border-gray-100 rounded-2xl">
                  <label className="text-xs font-black text-black-1 uppercase tracking-wider block">Project Gantt Chart / Implementation Schedule</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-5 hover:bg-gray-100 border border-dashed border-gray-300 rounded-xl cursor-pointer text-xs font-bold text-gray-3">
                      <Upload size={14} /> Upload PDF
                      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, setGanttChartFile)} className="hidden" />
                    </label>
                    {ganttChartFile ? <span className="text-xs text-success font-bold">Uploaded</span> : <span className="text-xs text-gray-2">Not uploaded</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-black-1 pb-4 border-b border-gray-100">5. Review & Finalize Submission</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-3 uppercase tracking-wider">Company & Offer summary</h3>
                  <div className="p-6 bg-gray-5 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-gray-2">
                      <span>Company Name:</span>
                      <span className="text-black-2">{companyName}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-2">
                      <span>Total Bid Price:</span>
                      <span className="text-[#a03d11] font-black">LKR {boqTotalSum.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-2">
                      <span>Bid Security issuer:</span>
                      <span className="text-black-2">{bidSecurityIssuer}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-2">
                      <span>Bid Security Value:</span>
                      <span className="text-black-2">LKR {Number(bidSecurityValue).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-3 uppercase tracking-wider">Additional Bid Notes / Clarifications</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional remarks or notes for the procurement board..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl py-3 px-4 text-xs font-semibold text-black-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-gray-3 uppercase tracking-wider">Uploaded Documents Checklist</h3>
                  <div className="p-6 border border-gray-100 rounded-2xl space-y-3">
                    <DocRow label="Bid Security Certificate" uploaded={!!bidSecurityFile} />
                    {Number(tender?.estimatedBudget || 0) >= 5000000 && (
                      <DocRow label="PCA 3 Registration Certificate" uploaded={!!pca3File} />
                    )}
                    {tender?.procurementType === "WORKS" && (
                      <>
                        <DocRow label="CIDA Registration Certificate" uploaded={!!cidaFile} />
                        <DocRow label="CIDA History Record Book" uploaded={!!cidaHistoryBookFile} />
                      </>
                    )}
                    {(tender?.procurementType === "GOODS" || tender?.procurementType === "SERVICES") && tender?.dynamicData?.mafRequired && (
                      <DocRow label="Manufacturer Authorization Form" uploaded={!!mafFile} />
                    )}
                    <DocRow label="Technical Staff CVs" uploaded={!!cvsFile} />
                    <DocRow label="Execution Methodology" uploaded={!!methodologyFile} />
                    <DocRow label="Gantt Chart Schedule" uploaded={!!ganttChartFile} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-8 py-3.5 border border-gray-200 hover:bg-gray-5 rounded-2xl font-bold text-sm text-black-2 transition-all active:scale-95"
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-10 py-3.5 bg-primary text-white hover:bg-primary/95 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:shadow-primary active:scale-95"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-12 py-4 bg-[#a03d11] text-white hover:bg-[#8a330e] disabled:bg-[#a03d11]/50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-lg active:scale-[0.97]"
              >
                {submitting ? "Securing Bid..." : "Submit Bid Now"}
              </button>
            )}
          </div>
        </div>
      </div>
    </TenderLayout>
  );
}

function DocRow({ label, uploaded }: { label: string; uploaded: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs font-bold py-1">
      <span className="text-gray-2">{label}</span>
      {uploaded ? (
        <span className="text-success flex items-center gap-1"><Check size={14} /> Uploaded</span>
      ) : (
        <span className="text-gray-3">Optional/Not provided</span>
      )}
    </div>
  );
}
