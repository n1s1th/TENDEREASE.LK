// ─── Evaluation Analytics API ───────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Types ──────────────────────────────────────────────────

export interface EvalAnalyticsFilters {
  dateRange?: string;
  category?: string;
  tenderId?: string;
  department?: string;
}

export interface EvalAnalyticsKpi {
  avgTechnicalScore: number;
  avgTechnicalScoreDelta: number;
  overallPassRate: number;
  overallPassRateDelta: number;
  totalBidsEvaluated: number;
  totalBidsEvaluatedDelta: number;
  tendersWithHighBidders: number;
  totalTenders: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface ScoreDistributionBucket {
  range: string;
  count: number;
}

export interface CategoryScore {
  category: string;
  avgScore: number;
}

export interface TenderEvalSummaryRow {
  tenderId: string;
  tenderTitle: string;
  category: string;
  department: string;
  bidCount: number;
  avgScore: number;
  passRate: number;
  status: "Live" | "Awarded" | "Closed" | "Cancelled";
  closingDate?: string;
  bidderScores?: number[];
}

export interface EvalAnalyticsData {
  kpi: EvalAnalyticsKpi;
  bidderCountTrend: TrendPoint[];
  scoreDistribution: ScoreDistributionBucket[];
  passRatePassed: number;
  passRateFailed: number;
  avgTechnicalScoreGauge: number;
  scoreThreshold: number;
  categoryScores: CategoryScore[];
  tenderSummary: TenderEvalSummaryRow[];
  totalTenderSummaryCount: number;
}

// ── Mock data (used as fallback) ───────────────────────────

const MOCK_DATA: EvalAnalyticsData = {
  kpi: {
    avgTechnicalScore: 72.4,
    avgTechnicalScoreDelta: 3.1,
    overallPassRate: 64,
    overallPassRateDelta: -2,
    totalBidsEvaluated: 187,
    totalBidsEvaluatedDelta: 24,
    tendersWithHighBidders: 18,
    totalTenders: 35,
  },
  bidderCountTrend: [
    { label: "Jun, 2025", value: 6 },
    { label: "Jul, 2025", value: 9 },
    { label: "Aug, 2025", value: 10 },
    { label: "Sep, 2025", value: 11 },
    { label: "Oct, 2025", value: 13 },
    { label: "Nov, 2025", value: 12 },
    { label: "Dec, 2025", value: 15 },
    { label: "Jan, 2026", value: 16 },
  ],
  scoreDistribution: [
    { range: "0–20", count: 8 },
    { range: "21–40", count: 14 },
    { range: "41–60", count: 32 },
    { range: "61–80", count: 55 },
    { range: "81–100", count: 38 },
  ],
  passRatePassed: 120,
  passRateFailed: 67,
  avgTechnicalScoreGauge: 75,
  scoreThreshold: 60,
  categoryScores: [
    { category: "Goods", avgScore: 78.2 },
    { category: "Works", avgScore: 74.5 },
    { category: "Services", avgScore: 70.1 },
    { category: "Consultancy", avgScore: 65.8 },
    { category: "Consulting Services", avgScore: 62.3 },
    { category: "Non Consulting Services", avgScore: 58.7 },
  ],
  tenderSummary: [
    { tenderId: "TND-0041", tenderTitle: "ERP System Upgrade", category: "IT & Software", department: "IT Division", bidCount: 9, avgScore: 78.3, passRate: 78, status: "Live" },
    { tenderId: "TND-0035", tenderTitle: "Office Stationery Supply", category: "Supplies", department: "Admin", bidCount: 12, avgScore: 70.4, passRate: 67, status: "Awarded" },
    { tenderId: "TND-0031", tenderTitle: "HR Recruitment Platform", category: "Consulting", department: "HR", bidCount: 4, avgScore: 68.2, passRate: 50, status: "Closed" },
    { tenderId: "TND-0029", tenderTitle: "Bridge Inspection Works", category: "Infrastructure", department: "Works", bidCount: 11, avgScore: 62.5, passRate: 45, status: "Awarded" },
    { tenderId: "TND-0024", tenderTitle: "Network Infrastructure Upgrade", category: "IT & Software", department: "IT Division", bidCount: 7, avgScore: 81.0, passRate: 86, status: "Awarded" },
    { tenderId: "TND-0022", tenderTitle: "School Furniture Supply", category: "Supplies", department: "Education", bidCount: 15, avgScore: 69.8, passRate: 73, status: "Closed" },
    { tenderId: "TND-0018", tenderTitle: "Road Marking Maintenance", category: "Infrastructure", department: "Roads", bidCount: 8, avgScore: 60.1, passRate: 38, status: "Live" },
    { tenderId: "TND-0015", tenderTitle: "Financial Advisory Services", category: "Consulting", department: "Finance", bidCount: 5, avgScore: 73.6, passRate: 60, status: "Live" },
    { tenderId: "TND-0011", tenderTitle: "Server Room Cooling System", category: "IT & Software", department: "IT Division", bidCount: 6, avgScore: 77.2, passRate: 67, status: "Closed" },
  ],
  totalTenderSummaryCount: 35,
};

// ── API Functions ──────────────────────────────────────────

export async function fetchEvalAnalytics(
  filters: EvalAnalyticsFilters = {},
  token?: string
): Promise<EvalAnalyticsData> {
  try {
    // 1. Fetch assigned tenders from the database
    const TENDER_SERVICE = process.env.NEXT_PUBLIC_TENDER_SERVICE_URL || "http://localhost:8082";
    const tendersUrl = `${TENDER_SERVICE}/api/officer/dashboard/tenders?size=100`;
    const tendersRes = await fetch(tendersUrl);
    
    let dbTenders: any[] = [];
    if (tendersRes.ok) {
      const json = await tendersRes.json();
      dbTenders = json.data?.content || [];
    }

    // 2. Fetch evaluation mock data for each tender and build rows
    const rowsPromise = dbTenders.map(async (t) => {
      try {
        const evalRes = await fetch(`${BASE}/api/evaluations/mock/${t.tenderNo}/data`);
        if (evalRes.ok) {
          const evalJson = await evalRes.json();
          const evalData = evalJson.data; // TenderEvaluationData
          const bidders = evalData?.bidders || [];
          
          const bidCount = bidders.length;
          // Map tender status to UI statuses: "Live" | "Awarded" | "Closed" | "Cancelled"
          let status: "Live" | "Awarded" | "Closed" | "Cancelled" = "Live";
          if (t.status === "COMPLETED") status = "Closed";
          else if (t.status === "APPROVED") status = "Awarded";
          else if (t.status === "CANCELLED") status = "Cancelled";

          let passedCount = 0;
          let totalScore = 0;
          const bidderScores: number[] = [];

          if (status !== "Live") {
            bidders.forEach((b: any) => {
              const techCriteria = b.technicalCriteria || [];
              const finCriteria = b.financialCriteria || [];
              
              const techSubtotal = techCriteria.reduce((sum: number, c: any) => sum + (c.score || 0) * ((c.weight || 0) / 100), 0);
              const finSubtotal = finCriteria.reduce((sum: number, c: any) => sum + (c.score || 0) * ((c.weight || 0) / 100), 0);
              
              const compositeScore = techSubtotal * 0.7 + (techSubtotal >= 75 ? finSubtotal * 0.3 : 0.0);
              
              totalScore += compositeScore;
              bidderScores.push(compositeScore);
              
              if (techSubtotal >= 75) {
                passedCount++;
              }
            });
          }

          const avgScore = status !== "Live" && bidCount > 0 ? Number((totalScore / bidCount).toFixed(1)) : 0.0;
          const passRate = status !== "Live" && bidCount > 0 ? Math.round((passedCount / bidCount) * 100) : 0;

          return {
            tenderId: t.tenderNo,
            tenderTitle: t.title,
            category: t.procurementType || t.category || "General",
            department: t.department || "IT Division",
            bidCount,
            avgScore,
            passRate,
            status,
            closingDate: t.closingDate || t.createdDate || "",
            bidderScores,
          };
        }
      } catch (e) {
        console.warn("Failed to fetch evaluation details for " + t.tenderNo, e);
      }

      // Fallback row if evaluation mock data fetch fails
      let fallbackStatus: "Live" | "Awarded" | "Closed" | "Cancelled" = "Live";
      if (t.status === "COMPLETED") fallbackStatus = "Closed";
      else if (t.status === "APPROVED") fallbackStatus = "Awarded";

      return {
        tenderId: t.tenderNo,
        tenderTitle: t.title,
        category: t.procurementType || t.category || "General",
        department: t.department || "IT Division",
        bidCount: 0,
        avgScore: 0.0,
        passRate: 0,
        status: fallbackStatus,
        closingDate: t.closingDate || t.createdDate || "",
        bidderScores: [],
      };
    });

    const tenderSummary = await Promise.all(rowsPromise);

    // Apply filters if set
    let filteredSummary = tenderSummary;
    if (filters.category) {
      filteredSummary = filteredSummary.filter(r => r.category.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters.tenderId) {
      filteredSummary = filteredSummary.filter(r => r.tenderId.toLowerCase().includes(filters.tenderId!.toLowerCase()));
    }
    if (filters.dateRange) {
      const now = new Date();
      let limitDays = 999999;
      if (filters.dateRange === "last_7_days") limitDays = 7;
      else if (filters.dateRange === "last_30_days") limitDays = 30;
      else if (filters.dateRange === "last_3_months") limitDays = 90;
      else if (filters.dateRange === "last_6_months") limitDays = 180;
      else if (filters.dateRange === "last_year") limitDays = 365;

      filteredSummary = filteredSummary.filter((r) => {
        if (!r.closingDate) return true;
        try {
          const d = new Date(r.closingDate);
          if (isNaN(d.getTime())) return true;
          const diffDays = Math.abs((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= limitDays;
        } catch {
          return true;
        }
      });
    }

    // 3. Fallback to mock data if no tenders exist in database, so page isn't blank
    if (tenderSummary.length === 0) {
      return MOCK_DATA;
    }

    // Recalculate KPI numbers based on filtered database values
    const totalTenders = filteredSummary.length;
    const totalBidsEvaluated = filteredSummary.reduce((sum, r) => sum + r.bidCount, 0); // Keep bidder count updated
    
    // Filter out live tenders for calculations related to evaluation scores/pass rates
    const nonLiveTenders = filteredSummary.filter(r => r.status !== "Live");
    const nonLiveBidsCount = nonLiveTenders.reduce((sum, r) => sum + r.bidCount, 0);
    
    const totalPassed = nonLiveTenders.reduce((sum, r) => sum + Math.round((r.passRate / 100) * r.bidCount), 0);
    const overallPassRate = nonLiveBidsCount > 0 ? Math.round((totalPassed / nonLiveBidsCount) * 100) : 0;
    const totalScoreSum = nonLiveTenders.reduce((sum, r) => sum + (r.avgScore * r.bidCount), 0);
    const avgTechnicalScore = nonLiveBidsCount > 0 ? Number((totalScoreSum / nonLiveBidsCount).toFixed(1)) : 0;

    const scores: number[] = [];
    nonLiveTenders.forEach((r) => {
      if (r.bidderScores) {
        scores.push(...r.bidderScores);
      }
    });

    const distribution = [
      { range: "0–20", count: 0 },
      { range: "21–40", count: 0 },
      { range: "41–60", count: 0 },
      { range: "61–80", count: 0 },
      { range: "81–100", count: 0 },
    ];

    scores.forEach((s) => {
      if (s >= 0 && s <= 20) distribution[0].count++;
      else if (s > 20 && s <= 40) distribution[1].count++;
      else if (s > 40 && s <= 60) distribution[2].count++;
      else if (s > 60 && s <= 80) distribution[3].count++;
      else if (s > 80 && s <= 100) distribution[4].count++;
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    const avgBidders = totalTenders > 0 && totalBidsEvaluated > 0 ? (totalBidsEvaluated / totalTenders) : 0;

    let bidderCountTrend: Array<{ label: string; value: number }> = [];

    if (filters.dateRange === "last_7_days") {
      // Daily trend (last 7 days)
      const daysList: Array<{ dateStr: string; label: string; totalBids: number; tenderCount: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const monthLabel = months[d.getMonth()];
        const dayNum = d.getDate();
        daysList.push({
          dateStr: d.toDateString(),
          label: `${monthLabel} ${dayNum}, ${d.getFullYear()}`,
          totalBids: 0,
          tenderCount: 0,
        });
      }

      filteredSummary.forEach((t) => {
        if (!t.closingDate) return;
        try {
          const d = new Date(t.closingDate);
          if (!isNaN(d.getTime())) {
            const dateStr = d.toDateString();
            const target = daysList.find(item => item.dateStr === dateStr);
            if (target) {
              target.totalBids += t.bidCount;
              target.tenderCount++;
            }
          }
        } catch {}
      });

      bidderCountTrend = daysList.map((item) => ({
        label: item.label,
        value: item.tenderCount > 0 ? Number((item.totalBids / item.tenderCount).toFixed(1)) : 0,
      }));

    } else if (filters.dateRange === "last_30_days") {
      // Weekly trend (5 weeks back)
      const weeksList: Array<{ start: Date; end: Date; label: string; totalBids: number; tenderCount: number }> = [];
      for (let i = 4; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1) * 7);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i * 7);
        weeksList.push({
          start,
          end,
          label: i === 0 ? "This Week" : `${i}w ago`,
          totalBids: 0,
          tenderCount: 0,
        });
      }

      filteredSummary.forEach((t) => {
        if (!t.closingDate) return;
        try {
          const d = new Date(t.closingDate);
          if (!isNaN(d.getTime())) {
            const target = weeksList.find(item => d >= item.start && d <= item.end);
            if (target) {
              target.totalBids += t.bidCount;
              target.tenderCount++;
            }
          }
        } catch {}
      });

      bidderCountTrend = weeksList.map((item) => ({
        label: item.label,
        value: item.tenderCount > 0 ? Number((item.totalBids / item.tenderCount).toFixed(1)) : 0,
      }));

    } else if (filters.dateRange === "last_3_months") {
      // 3 Months trend
      const trendMonths: Array<{ label: string; year: number; monthIndex: number; totalBids: number; tenderCount: number }> = [];
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendMonths.push({
          label: `${months[d.getMonth()]}, ${d.getFullYear()}`,
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          totalBids: 0,
          tenderCount: 0,
        });
      }

      filteredSummary.forEach((t) => {
        if (!t.closingDate) return;
        try {
          const d = new Date(t.closingDate);
          if (!isNaN(d.getTime())) {
            const target = trendMonths.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
            if (target) {
              target.totalBids += t.bidCount;
              target.tenderCount++;
            }
          }
        } catch {}
      });

      bidderCountTrend = trendMonths.map((m) => ({
        label: m.label,
        value: m.tenderCount > 0 ? Number((m.totalBids / m.tenderCount).toFixed(1)) : 0,
      }));

    } else if (filters.dateRange === "last_6_months") {
      // 6 Months trend
      const trendMonths: Array<{ label: string; year: number; monthIndex: number; totalBids: number; tenderCount: number }> = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendMonths.push({
          label: `${months[d.getMonth()]}, ${d.getFullYear()}`,
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          totalBids: 0,
          tenderCount: 0,
        });
      }

      filteredSummary.forEach((t) => {
        if (!t.closingDate) return;
        try {
          const d = new Date(t.closingDate);
          if (!isNaN(d.getTime())) {
            const target = trendMonths.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
            if (target) {
              target.totalBids += t.bidCount;
              target.tenderCount++;
            }
          }
        } catch {}
      });

      bidderCountTrend = trendMonths.map((m) => ({
        label: m.label,
        value: m.tenderCount > 0 ? Number((m.totalBids / m.tenderCount).toFixed(1)) : 0,
      }));

    } else {
      // Last 8 months (default or all time)
      const trendMonths: Array<{ label: string; year: number; monthIndex: number; totalBids: number; tenderCount: number }> = [];
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trendMonths.push({
          label: `${months[d.getMonth()]}, ${d.getFullYear()}`,
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          totalBids: 0,
          tenderCount: 0,
        });
      }

      filteredSummary.forEach((t) => {
        if (!t.closingDate) return;
        try {
          const d = new Date(t.closingDate);
          if (!isNaN(d.getTime())) {
            const target = trendMonths.find(m => m.monthIndex === d.getMonth() && m.year === d.getFullYear());
            if (target) {
              target.totalBids += t.bidCount;
              target.tenderCount++;
            }
          }
        } catch {}
      });

      bidderCountTrend = trendMonths.map((m) => ({
        label: m.label,
        value: m.tenderCount > 0 ? Number((m.totalBids / m.tenderCount).toFixed(1)) : 0,
      }));
    }

    const procurementTypes = ["Goods", "Works", "Services", "Consultancy", "Consulting Services", "Non Consulting Services"];

    const typeAverages = procurementTypes.map((type) => {
      const matchingTenders = nonLiveTenders.filter(r => {
        const cat = r.category.toLowerCase();
        const t = type.toLowerCase();
        if (cat === t) return true;
        if (t === "goods" && (cat.includes("goods") || cat.includes("supplies"))) return true;
        if (t === "works" && (cat.includes("works") || cat.includes("infrastructure") || cat.includes("roads"))) return true;
        if (t === "services" && cat.includes("service")) return true;
        if (t.includes("consult") && cat.includes("consult")) return true;
        return false;
      });
      const totalBids = matchingTenders.reduce((sum, r) => sum + r.bidCount, 0);
      const totalScore = matchingTenders.reduce((sum, r) => sum + (r.avgScore * r.bidCount), 0);
      const avgScore = totalBids > 0 ? Number((totalScore / totalBids).toFixed(1)) : 0;
      return {
        category: type,
        avgScore,
      };
    });

    return {
      kpi: {
        avgTechnicalScore,
        avgTechnicalScoreDelta: 3.1,
        overallPassRate,
        overallPassRateDelta: -2,
        totalBidsEvaluated,
        totalBidsEvaluatedDelta: 24,
        tendersWithHighBidders: filteredSummary.filter(r => r.bidCount > 5).length,
        totalTenders,
      },
      bidderCountTrend,
      scoreDistribution: distribution,
      passRatePassed: nonLiveTenders.reduce((sum, r) => sum + Math.round((r.passRate / 100) * r.bidCount), 0),
      passRateFailed: nonLiveTenders.reduce((sum, r) => sum + (r.bidCount - Math.round((r.passRate / 100) * r.bidCount)), 0),
      avgTechnicalScoreGauge: avgTechnicalScore,
      scoreThreshold: 75,
      categoryScores: typeAverages,
      tenderSummary: filteredSummary,
      totalTenderSummaryCount: filteredSummary.length,
    };
  } catch (error) {
    console.error("Failed to fetch real analytics from database, falling back to mock:", error);
    return MOCK_DATA;
  }
}
